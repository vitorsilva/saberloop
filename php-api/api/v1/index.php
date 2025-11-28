 <?php
  ini_set('display_errors', 0);
  ini_set('log_errors', 1);
  error_log('=== API Request Started ===');
  error_log('Endpoint: ' . (isset($_GET['endpoint']) ? $_GET['endpoint'] : 'none'));

  set_time_limit(120);

  // Set JSON content type for all responses
  header('Content-Type: application/json');

  // Get the request method and path
  $method = $_SERVER['REQUEST_METHOD'];
  $requestUri = $_SERVER['REQUEST_URI'];

  // Parse the endpoint from the URL
  // Try 1: From path (e.g., /quiz-generator/api/v1/health-check)
  $path = parse_url($requestUri, PHP_URL_PATH);
  $pathParts = explode('/api/v1/', $path);
  $endpoint = isset($pathParts[1]) ? trim($pathParts[1], '/') : '';

  // Try 2: If endpoint is empty or is 'index.php', check query parameter
  if (empty($endpoint) || $endpoint === 'index.php') {
      $endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
  }

  // Include endpoint handlers
  require_once __DIR__ . '/../../src/endpoints/health-check.php';
  require_once __DIR__ . '/../../src/endpoints/generate-questions.php';
  require_once __DIR__ . '/../../src/endpoints/generate-explanation.php';

  // Route the request
  try {
      switch ($endpoint) {
          case 'health-check':
              if ($method !== 'GET') {
                  sendResponse(405, array('error' => 'Method not allowed'));
              }
              $result = handleHealthCheck();
              sendResponse(200, $result);
              break;

          case 'generate-questions':
              if ($method !== 'POST') {
                  sendResponse(405, array('error' => 'Method not allowed'));
              }
              $requestBody = file_get_contents('php://input');
              $result = handleGenerateQuestions($requestBody);
              sendResponse($result['statusCode'], $result['body']);
              break;

          case 'generate-explanation':
              if ($method !== 'POST') {
                  sendResponse(405, array('error' => 'Method not allowed'));
              }
              $requestBody = file_get_contents('php://input');
              $result = handleGenerateExplanation($requestBody);
              sendResponse($result['statusCode'], $result['body']);
              break;

          default:
              sendResponse(404, array('error' => 'Endpoint not found: ' . $endpoint));
              break;
      }
  } catch (Exception $e) {
      error_log('Router error: ' . $e->getMessage());
      sendResponse(500, array(
          'error' => 'Internal server error',
          'message' => $e->getMessage()
      ));
  }

  /**
   * Send JSON response with status code
   */
  function sendResponse($statusCode, $data)
  {
      http_response_code($statusCode);
      echo json_encode($data);
      exit;
  }