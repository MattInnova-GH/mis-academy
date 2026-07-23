<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChatbotMessageRequest;
use App\Services\ChatbotService;

class ChatbotController extends Controller
{
    public function __construct(private ChatbotService $chatbotService)
    {
    }

    public function chat(ChatbotMessageRequest $request)
    {
        $message = trim($request->validated('message'));

        $response = $this->chatbotService->getResponse($message);

        return response()->json([
            'ok' => true,
            ...$response,
        ]);
    }
}