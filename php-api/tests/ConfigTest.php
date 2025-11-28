<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../src/Config.php';

class ConfigTest extends TestCase
{
    public function testGetReturnsNullForMissingKey()
    {
        $result = Config::get('NON_EXISTENT_KEY');
        $this->assertEquals('', $result);
    }

    public function testGetReturnsDefaultForMissingKey()
    {
        $result = Config::get('NON_EXISTENT_KEY', 'default_value');
        $this->assertEquals('default_value', $result);
    }
}