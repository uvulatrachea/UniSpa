# Start Laravel dev server using PHP that has pdo_mysql enabled (fixes "could not find driver")
# Use this when running locally without Docker.
$php = "C:\php-8.4.17\php.exe"
if (-not (Test-Path $php)) {
    Write-Host "PHP not found at $php. Install PHP 8.4 there or edit this script." -ForegroundColor Red
    exit 1
}
& $php artisan serve --port=8080
