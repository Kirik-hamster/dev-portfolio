<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function publicProfile(User $user)
    {
        // Твоя логика подсчета лайков (оставляем как есть)
        $articleLikes = DB::table('article_likes')
            ->whereIn('article_id', $user->articles()->select('id')) // select чуть быстрее pluck здесь
            ->count();

        $blogLikes = DB::table('blog_likes')
            ->whereIn('blog_id', $user->blogs()->select('id'))
            ->count();

        $commentLikes = DB::table('comment_likes')
            ->whereIn('comment_id', $user->comments()->select('id'))
            ->count();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'role'  => $user->role,
            'banned_until' => $user->banned_until,
            'stats' => [
                'articles_count' => $user->articles()->count(),
                'blogs_count'    => $user->blogs()->count(),
                'comments_count' => $user->comments()->count(),
                'total_likes'    => $articleLikes + $blogLikes + $commentLikes,
                'likes_split'    => [
                    'articles' => $articleLikes,
                    'blogs'    => $blogLikes,
                    'comments' => $commentLikes,
                ]
            ]
        ]);
    }
}