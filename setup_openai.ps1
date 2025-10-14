# OpenAI API Key Setup Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   OpenAI API Key Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set the OpenAI API Key
# REPLACE THIS WITH YOUR ACTUAL API KEY
$OPENAI_API_KEY = "sk-proj-REPLACE_WITH_YOUR_ACTUAL_OPENAI_API_KEY"

# Set environment variable for current session
$env:OPENAI_API_KEY = $OPENAI_API_KEY

Write-Host "✓ OpenAI API Key set for current session" -ForegroundColor Green
Write-Host ""
Write-Host "The API key is now active for this PowerShell session." -ForegroundColor Yellow
Write-Host ""
Write-Host "To make it permanent (optional):" -ForegroundColor Cyan
Write-Host "1. Open System Properties > Environment Variables" -ForegroundColor White
Write-Host "2. Add a new User variable:" -ForegroundColor White
Write-Host "   Name: OPENAI_API_KEY" -ForegroundColor White
Write-Host "   Value: $OPENAI_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "Now restart your Flask server for the changes to take effect!" -ForegroundColor Green
Write-Host ""
Write-Host "Setup complete! The API key is active for this session." -ForegroundColor Cyan

