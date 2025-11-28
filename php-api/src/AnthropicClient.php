<?php

require_once __DIR__ . '/Config.php';

class AnthropicClient
{
    private $apiKey;
    private $baseUrl = 'https://api.anthropic.com/v1';
    private $model = 'claude-sonnet-4-20250514';
    public function __construct()
    {
        $this->apiKey = Config::get('ANTHROPIC_API_KEY');
        if (empty($this->apiKey)) {
            throw new Exception('ANTHROPIC_API_KEY not configured');
        }
    }
    /**
     * Send a message to Claude and get a response
     */
    public function sendMessage($systemPrompt, $userMessage, $maxTokens = 1024)
    {
        $url = $this->baseUrl . '/messages';
        $payload = array(
            'model' => $this->model,
            'max_tokens' => $maxTokens,
            'system' => $systemPrompt,
            'messages' => array(
                array(
                    'role' => 'user',
                    'content' => $userMessage
                )
            )
        );
        $headers = array(
            'Content-Type: application/json',
            'x-api-key: ' . $this->apiKey,
            'anthropic-version: 2023-06-01'
        );
        $response = $this->makeRequest($url, $payload, $headers);
        return $response;
    }
    /**
     * Make HTTP request using cURL
     */
    private function makeRequest($url, $payload, $headers)
    {
        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_SSL_VERIFYPEER => true
        ));
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        if ($error) {
            throw new Exception('cURL error: ' . $error);
        }
        $decoded = json_decode($response, true);
        if ($httpCode !== 200) {
            $errorMessage = isset($decoded['error']['message'])
                ? $decoded['error']['message']
                : 'API request failed';
            throw new Exception('Anthropic API error: ' . $errorMessage);
        }
        return $decoded;
    }
    /**
     * Extract text content from Claude's response
     */
    public function extractText($response)
    {
        if (isset($response['content'][0]['text'])) {
            return $response['content'][0]['text'];
        }
        return '';
    }
}