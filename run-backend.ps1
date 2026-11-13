$ErrorActionPreference = "Stop"

$secret = $env:JWT_SECRET
if ([string]::IsNullOrWhiteSpace($secret)) {
    $secret = [Environment]::GetEnvironmentVariable("JWT_SECRET", "User")
}

if ([string]::IsNullOrWhiteSpace($secret) -or
    [System.Text.Encoding]::UTF8.GetByteCount($secret) -lt 32) {
    $bytes = New-Object byte[] 48
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $random.GetBytes($bytes)
    }
    finally {
        $random.Dispose()
    }

    $secret = [Convert]::ToBase64String($bytes)
    [Environment]::SetEnvironmentVariable("JWT_SECRET", $secret, "User")
    Write-Host "Created and saved a secure JWT secret for your Windows user."
}

$env:JWT_SECRET = $secret
& (Join-Path $PSScriptRoot "mvnw.cmd") spring-boot:run
exit $LASTEXITCODE
