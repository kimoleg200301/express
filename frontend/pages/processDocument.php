<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    $conn = new mysqli("localhost", "root", "", "docx");
    if ($conn->connect_error) {
        throw new Exception('Ошибка подключения к базе данных: ' . $conn->connect_error);
    }

    if (!isset($_POST['items']) || !is_array($_POST['items']) || count($_POST['items']) < 8) {
        throw new Exception('Недостаточно данных для обработки запроса');
    }

    $text = $_POST['items'];
    $docType = $_POST['docType'] ?? 'driver license';
    $table = $docType === 'ud_lichnosty' ? 'ud.lichnosty' : 'driver license';

    // Общая логика для выбора нужных данных на основе типа документа
    $searchText_IIN = $docType === 'ud_lichnosty' ? trim((string)$text[4]) : substr(trim((string)$text[7]), -12);

    $stmt_searchText_IIN = $conn->prepare("SELECT * FROM `$table` WHERE `ИИН` = ?");
    if (!$stmt_searchText_IIN) {
        throw new Exception('Ошибка подготовки запроса: ' . $conn->error);
    }

    $stmt_searchText_IIN->bind_param("s", $searchText_IIN);
    $stmt_searchText_IIN->execute();
    $result_searchText_IIN = $stmt_searchText_IIN->get_result();

    if ($result_searchText_IIN->num_rows > 0) {
        if ($docType === 'ud_lichnosty') {
            $searchText_ID = trim((string)$text[5]);
            $stmt_searchText_ID = $conn->prepare("SELECT `Номер УД` FROM `$table` WHERE `ИИН` = ?");
            if (!$stmt_searchText_ID) {
                throw new Exception('Ошибка подготовки запроса: ' . $conn->error);
            }

            $stmt_searchText_ID->bind_param("s", $searchText_IIN);
            $stmt_searchText_ID->execute();
            $result_searchText_ID = $stmt_searchText_ID->get_result();
            if ($result_searchText_ID->num_rows > 0) {
                $text_ID = $result_searchText_ID->fetch_assoc()['Номер УД'];
                if ($text_ID == $searchText_ID) {
                    // Проверка срока действия
                    checkDocumentValidity($conn, $table, $searchText_IIN);
                } else {
                    echo json_encode(['message' => 'Документ фальшивый. Не совпадают ID с базой данных']);
                }
            } else {
                echo json_encode(['message' => 'Документ фальшивый.']);
            }
        } else {
            echo json_encode(['message' => 'Документ зарегистрирован.']);
        }
    } else {
        echo json_encode(['message' => 'Документ фальшивый.']);
    }
} catch (Exception $e) {
    echo json_encode(['message' => $e->getMessage()]);
} finally {
    $stmt_searchText_IIN->close();
    if (isset($stmt_searchText_ID)) {
        $stmt_searchText_ID->close();
    }
    $conn->close();
}

function checkDocumentValidity($conn, $table, $searchText_IIN) {
    $stmt = $conn->prepare("SELECT `Дата выдачи - Срок действия` FROM `$table` WHERE `ИИН` = ?");
    if (!$stmt) {
        throw new Exception('Ошибка подготовки запроса: ' . $conn->error);
    }
    $stmt->bind_param("s", $searchText_IIN);
    $stmt->execute();
    $result = $stmt->get_result();
    $expirationDateStr = $result->fetch_assoc()['Дата выдачи - Срок действия'];
    $expirationDate = new DateTime(substr($expirationDateStr, -10));
    $now = new DateTime();

    if ($expirationDate > $now) {
        $interval = $now->diff($expirationDate);
        echo json_encode(['message' => 'Документ зарегистрирован.', 'days_until_expiration' => $interval->days]);
    } else {
        echo json_encode(['message' => 'Документ просрочен.']);
    }
    $stmt->close();
}
?>
