<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentMetadata extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'google_file_id',
        'document_number',
        'category',
        'department',
        'status',
        'expired_at',
        'pic_emails',
    ];

    protected $casts = [
        'expired_at' => 'date',
        'pic_emails' => 'array',
    ];
}
