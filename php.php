<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$phoneNumber = trim((string) ($payload['phone_number'] ?? ''));
$amount = filter_var($payload['amount'] ?? null, FILTER_VALIDATE_INT);
$accountReference = trim((string) ($payload['account_reference'] ?? 'JONAI'));

if (!preg_match('/^254[17][0-9]{8}$/', $phoneNumber) || $amount === false || $amount < 1 || $amount > 1_000_000) {
    http_response_code(422);
    echo json_encode(['error' => 'Enter a valid Kenyan phone number and amount.']);
    exit;
}

$shortcode = getenv('MPESA_SHORTCODE');
$passkey = getenv('MPESA_PASSKEY');
$consumerKey = getenv('MPESA_CONSUMER_KEY');
$consumerSecret = getenv('MPESA_CONSUMER_SECRET');
$callbackUrl = getenv('MPESA_CALLBACK_URL');
$baseUrl = rtrim((string) (getenv('MPESA_BASE_URL') ?: 'https://api.safaricom.co.ke'), '/');

if (!$shortcode || !$passkey || !$consumerKey || !$consumerSecret || !$callbackUrl) {
    http_response_code(503);
    echo json_encode(['error' => 'Payment service is not configured.']);
    exit;
}

function requestJson(string $url, array $headers, ?array $body = null): array
{
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $body === null ? 'GET' : 'POST',
    ]);

    if ($body !== null) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_THROW_ON_ERROR));
    }

    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($response === false || $error !== '') {
        throw new RuntimeException('Payment provider unavailable.');
    }

    $decoded = json_decode($response, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Invalid payment provider response.');
    }

    if ($status >= 400) {
        throw new RuntimeException((string) ($decoded['errorMessage'] ?? 'Payment request failed.'));
    }

    return $decoded;
}

try {
    $credentials = base64_encode($consumerKey . ':' . $consumerSecret);
    $tokenResponse = requestJson(
        $baseUrl . '/oauth/v1/generate?grant_type=client_credentials',
        ['Authorization: Basic ' . $credentials]
    );
    $accessToken = $tokenResponse['access_token'] ?? null;

    if (!is_string($accessToken) || $accessToken === '') {
        throw new RuntimeException('Could not authenticate with the payment provider.');
    }

    $timestamp = date('YmdHis');
    $password = base64_encode($shortcode . $passkey . $timestamp);
    $response = requestJson(
        $baseUrl . '/mpesa/stkpush/v1/processrequest',
        ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json'],
        [
            'BusinessShortCode' => $shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => $amount,
            'PartyA' => $phoneNumber,
            'PartyB' => $shortcode,
            'PhoneNumber' => $phoneNumber,
            'CallBackURL' => $callbackUrl,
            'AccountReference' => substr($accountReference, 0, 12),
            'TransactionDesc' => 'Jona Shoe Palace order',
        ]
    );

    echo json_encode([
        'success' => true,
        'request_id' => $response['CheckoutRequestID'] ?? null,
        'message' => $response['CustomerMessage'] ?? 'Check your phone to complete payment.',
    ]);
} catch (Throwable $error) {
    error_log('[mpesa] ' . $error->getMessage());
    http_response_code(502);
    echo json_encode(['error' => 'We could not start the payment. Please try again.']);
}
