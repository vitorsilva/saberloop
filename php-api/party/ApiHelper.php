<?php
/**
 * API Helper
 *
 * Common utilities for API endpoints: CORS, JSON responses, error handling.
 */

class ApiHelper
{
    /**
     * Set up CORS headers based on config.
     *
     * @param array $config Configuration array
     */
    public static function setupCors(array $config): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = $config['allowed_origins'] ?? [];

        // If origin is in allowed list, set the header
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$origin}");
        } elseif (empty($allowedOrigins)) {
            // If no origins specified, allow all (not recommended for production)
            header('Access-Control-Allow-Origin: *');
        }

        header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    /**
     * Send a JSON response.
     *
     * @param mixed $data Response data
     * @param int $statusCode HTTP status code
     */
    public static function jsonResponse($data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send a success response.
     *
     * @param mixed $data Response data
     * @param int $statusCode HTTP status code
     */
    public static function success($data, int $statusCode = 200): void
    {
        self::jsonResponse([
            'success' => true,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Send an error response.
     *
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param string|null $code Error code (optional)
     */
    public static function error(string $message, int $statusCode = 400, ?string $code = null): void
    {
        $response = [
            'success' => false,
            'error' => [
                'message' => $message,
            ],
        ];

        if ($code) {
            $response['error']['code'] = $code;
        }

        self::jsonResponse($response, $statusCode);
    }

    /**
     * Get JSON body from request.
     *
     * @return array Parsed JSON body
     * @throws Exception If body is invalid JSON
     */
    public static function getJsonBody(): array
    {
        $body = file_get_contents('php://input');

        if (empty($body)) {
            return [];
        }

        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON body: ' . json_last_error_msg(), 400);
        }

        return $data;
    }

    /**
     * Get the request method.
     *
     * @return string HTTP method (GET, POST, DELETE, etc.)
     */
    public static function getMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    /**
     * Get a required field from request body.
     *
     * @param array $body Request body
     * @param string $field Field name
     * @return mixed Field value
     * @throws Exception If field is missing
     */
    public static function requireField(array $body, string $field)
    {
        if (!isset($body[$field]) || (is_string($body[$field]) && trim($body[$field]) === '')) {
            throw new Exception("Missing required field: {$field}", 400);
        }

        return $body[$field];
    }

    /**
     * Parse path parameters from URL.
     *
     * Example: For URL /party/rooms/ABC123/join and pattern /party/rooms/{code}/{action}
     * Returns: ['code' => 'ABC123', 'action' => 'join']
     *
     * @param string $pathInfo The PATH_INFO
     * @return array Path segments
     */
    public static function parsePath(string $pathInfo): array
    {
        $segments = array_values(array_filter(explode('/', $pathInfo)));
        return $segments;
    }
}
