#Requires AutoHotkey v2.0
#SingleInstance Force

; Optional companion for stronger window placement than Chrome extensions can provide.
; Hotkey: Ctrl+Alt+Shift+0
; Chrome extension manifests cannot declare Ctrl+Alt shortcuts, but AHK can.

chatGptUrl := "https://chatgpt.com"
chromeExe := "chrome.exe"
windowTitle := "ChatGPT"

; Adjust these for monitor 2. Use Window Spy or AHK's MonitorGetWorkArea if needed.
targetX := 1940
targetY := 80
targetW := 520
targetH := 860

^!+0::FocusOrLaunchChatGPT()

FocusOrLaunchChatGPT() {
    global chromeExe, chatGptUrl, windowTitle, targetX, targetY, targetW, targetH

    SetTitleMatchMode 2
    hwnd := WinExist(windowTitle " ahk_exe chrome.exe")

    if hwnd {
        WinRestore hwnd
        WinActivate hwnd
        WinMove targetX, targetY, targetW, targetH, hwnd
        return
    }

    Run Format('{} --app="{}"', chromeExe, chatGptUrl)

    if WinWait(windowTitle " ahk_exe chrome.exe", , 8) {
        hwnd := WinExist(windowTitle " ahk_exe chrome.exe")
        WinActivate hwnd
        WinMove targetX, targetY, targetW, targetH, hwnd
    }
}

; Alternative: bind a Logitech Options+ key to this script, to the extension's
; Chrome-valid shortcut, or to:
; chrome.exe --app=https://chatgpt.com
