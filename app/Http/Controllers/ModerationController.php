<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModerationController extends Controller
{
    // Отправка жалобы (для всех авторизованных)
    public function report(Request $request)
    {
        $data = $request->validate([
            'reported_id'     => 'required|exists:users,id',
            'reason'          => 'required|string|max:500',
            'reportable_id'   => 'required|integer',
            'reportable_type' => 'required|string|in:article,comment,blog',
        ]);

        if ($data['reported_id'] == Auth::id()) {
            return response()->json(['message' => 'Вы не можете пожаловаться на самого себя'], 422);
        }

        $typeMap = [
            'article' => \App\Models\Article::class,
            'comment' => \App\Models\Comment::class,
            'blog'    => \App\Models\Blog::class,
        ];

        $report = Report::create([
            'reporter_id'     => Auth::id(),
            'reported_id'     => $data['reported_id'],
            'reason'          => $data['reason'],
            'reportable_id'   => $data['reportable_id'],
            'reportable_type' => $typeMap[$data['reportable_type']],
        ]);

        return response()->json(['message' => 'Жалоба отправлена', 'report' => $report]);
    }

    // Список жалоб (для админа/модератора)
    public function index()
    {
        return Report::with(['reporter:id,name', 'reportedUser:id,name', 'reportable'])
            ->latest()
            ->paginate(20);
    }
    public function resolve(Report $report) {
        $report->update(['is_resolved' => true]);
        return response()->json(['message' => 'Рассмотрено']);
    }
}