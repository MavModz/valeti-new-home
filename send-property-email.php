<?php

declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Please submit the form using POST.',
    ]);
    exit;
}

$name = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? '');
$email = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL) ?? '');
$phone = trim(filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? '');
$message = trim(filter_input(INPUT_POST, 'message', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? '');
$propertyId = trim(filter_input(INPUT_POST, 'property_id', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? '');
$propertyUrl = trim(filter_input(INPUT_POST, 'property_url', FILTER_SANITIZE_URL) ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide your name, email, and message.',
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.',
    ]);
    exit;
}

// $adminEmail = 'Info@valeti.com.au';
$adminEmail = 'gauravchauhan10082@gmail.com';
$subjectParts = ['New property enquiry'];
if ($propertyId !== '') {
    $subjectParts[] = "ID: {$propertyId}";
}
$emailSubject = implode(' - ', $subjectParts);

$emailBody = [
    "You have received a new property enquiry via the Valeti website.",
    "",
    "Contact information:",
    "Name: {$name}",
    "Email: {$email}",
    $phone !== '' ? "Phone: {$phone}" : null,
    "",
    "Message:",
    $message,
    "",
    "Property details:",
    $propertyId !== '' ? "Property ID: {$propertyId}" : "Property ID: Not provided",
    $propertyUrl !== '' ? "Property link: {$propertyUrl}" : "Property link: Not available",
    "",
    'This message was sent on ' . date('Y-m-d H:i:s'),
];

$emailBody = implode(PHP_EOL, array_filter($emailBody, static fn($line) => $line !== null));

$headers = [
    'From: Valeti Website <no-reply@valeti.com.au>',
    "Reply-To: {$email}",
    'Content-Type: text/plain; charset=UTF-8',
];

$mailSent = @mail($adminEmail, $emailSubject, $emailBody, implode("\r\n", $headers));

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your message has been sent successfully.',
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, we could not send your message right now. Please try again later.',
    ]);
}

