<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_metadata', function (Blueprint $table) {
            $table->date('expired_at')->nullable()->after('status');
            $table->json('pic_emails')->nullable()->after('expired_at');
        });
    }

    public function down(): void
    {
        Schema::table('document_metadata', function (Blueprint $table) {
            $table->dropColumn(['expired_at', 'pic_emails']);
        });
    }
};
