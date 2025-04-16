<?php
$curl = curl_init();

$shortcode = 'YOUR_SHORT_CODE';
$passkey = 'YOUR_PASSKEY';
$consumer_key = 'YOUR_CONSUMER_KEY';
$consumer_secret = 'YOUR_CONSUMER_SECRET';
$phone_number = '2547XXXXXXXX'; // Replace with the customer's phone number
$amount = '1'; // Replace with the transaction amount
$callback_url = 'https://yourdomain.com/callback.php'; // Replace with your callback URL

$timestamp = date('YmdHis');
$password = base64_encode($shortcode . $passkey . $timestamp);

$data = [
    'BusinessShortCode' => $shortcode,
    'Password' => $password,
    'Timestamp' => $timestamp,
    'TransactionType' => 'CustomerPayBillOnline',
    'Amount' => $amount,
    'PartyA' => $phone_number,
    'PartyB' => $shortcode,
    'PhoneNumber' => $phone_number,
    'CallBackURL' => $callback_url,
    'AccountReference' => 'Your Account Reference',
    'TransactionDesc' => 'Payment for goods'
];

$access_token = get_access_token($consumer_key, $consumer_secret);

curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array(
        "Authorization: Bearer $access_token",
        "Content-Type: application/json"
    ),
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data)
));

$response = curl_exec($curl);
curl_close($curl);

function get_access_token($consumer_key, $consumer_secret) {
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array(
            "Authorization: Basic " . base64_encode($consumer_key . ':' . $consumer_secret)
        )
    ));
    $response = curl_exec($curl);
    curl_close($curl);
    $response_data = json_decode($response, true);
    return $response_data['access_token'];
}
?>