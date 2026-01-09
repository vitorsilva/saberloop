<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../party/ApiHelper.php';

class ApiHelperTest extends TestCase
{
    public function testParsePathReturnsEmptyArrayForEmptyPath()
    {
        $result = ApiHelper::parsePath('');
        $this->assertEquals([], $result);
    }

    public function testParsePathReturnsEmptyArrayForSlashOnly()
    {
        $result = ApiHelper::parsePath('/');
        $this->assertEquals([], $result);
    }

    public function testParsePathReturnsSingleSegment()
    {
        $result = ApiHelper::parsePath('/ABC123');
        $this->assertEquals(['ABC123'], $result);
    }

    public function testParsePathReturnsMultipleSegments()
    {
        $result = ApiHelper::parsePath('/ABC123/join');
        $this->assertEquals(['ABC123', 'join'], $result);
    }

    public function testParsePathHandlesTrailingSlash()
    {
        $result = ApiHelper::parsePath('/ABC123/join/');
        $this->assertEquals(['ABC123', 'join'], $result);
    }

    public function testParsePathHandlesMultipleSlashes()
    {
        $result = ApiHelper::parsePath('//ABC123///join//');
        $this->assertEquals(['ABC123', 'join'], $result);
    }

    public function testRequireFieldReturnsValue()
    {
        $body = ['hostId' => 'abc-123', 'hostName' => 'Test'];
        $result = ApiHelper::requireField($body, 'hostId');
        $this->assertEquals('abc-123', $result);
    }

    public function testRequireFieldThrowsForMissingField()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Missing required field: hostId');

        $body = ['hostName' => 'Test'];
        ApiHelper::requireField($body, 'hostId');
    }

    public function testRequireFieldThrowsForEmptyString()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Missing required field: hostId');

        $body = ['hostId' => '', 'hostName' => 'Test'];
        ApiHelper::requireField($body, 'hostId');
    }

    public function testRequireFieldThrowsForWhitespaceOnly()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Missing required field: hostId');

        $body = ['hostId' => '   ', 'hostName' => 'Test'];
        ApiHelper::requireField($body, 'hostId');
    }

    public function testRequireFieldAllowsZero()
    {
        $body = ['count' => 0];
        $result = ApiHelper::requireField($body, 'count');
        $this->assertEquals(0, $result);
    }

    public function testRequireFieldAllowsArrays()
    {
        $body = ['items' => ['a', 'b']];
        $result = ApiHelper::requireField($body, 'items');
        $this->assertEquals(['a', 'b'], $result);
    }
}
