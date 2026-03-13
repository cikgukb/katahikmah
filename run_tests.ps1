$headers = @{"x-api-key"="FShlTPVk0Mu9f3cecQgsGlqGLjdc3EgZpwAyqIFF"; "Content-Type"="application/json"}
try {
  $out = Invoke-RestMethod -Uri "https://api.json2video.com/v2/movies" -Method Post -Headers $headers -InFile payload_audio.json
  Write-Host "audio SUCCESS"
  $out | ConvertTo-Json -Depth 5
} catch {
  Write-Host "audio FAIL"
  $_.Exception.Response.Content.ReadAsStringAsync().Result
}
try {
  $out = Invoke-RestMethod -Uri "https://api.json2video.com/v2/movies" -Method Post -Headers $headers -InFile payload_voiceover.json
  Write-Host "voiceover SUCCESS"
  $out | ConvertTo-Json -Depth 5
} catch {
  Write-Host "voiceover FAIL"
  $_.Exception.Response.Content.ReadAsStringAsync().Result
}
try {
  $out = Invoke-RestMethod -Uri "https://api.json2video.com/v2/movies" -Method Post -Headers $headers -InFile payload_voice.json
  Write-Host "voice SUCCESS"
  $out | ConvertTo-Json -Depth 5
} catch {
  Write-Host "voice FAIL"
  $_.Exception.Response.Content.ReadAsStringAsync().Result
}
