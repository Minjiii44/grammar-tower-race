--[[
    StarterPlayer/StarterPlayerScripts/GrammarHUD.client.lua
    Place this LocalScript inside StarterPlayerScripts (or StarterGui inside a ScreenGui)
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local SoundService = game:GetService("SoundService")

local localPlayer = Players.LocalPlayer
local PlayerGui = localPlayer:WaitForChild("PlayerGui")

-- Remotes & Questions
local remoteFolder = ReplicatedStorage:WaitForChild("GrammarRemotes")
local SubmitAnswerRemote = remoteFolder:WaitForChild("SubmitAnswer")
local LavaSyncRemote = remoteFolder:WaitForChild("LavaSync")
local VictoryRemote = remoteFolder:WaitForChild("VictoryEvent")
local GrammarQuestions = require(ReplicatedStorage:WaitForChild("GrammarQuestions"))

-- Sound Effects
local function playSlamSound()
    local sound = Instance.new("Sound")
    sound.SoundId = "rbxassetid://9114223170" -- Brick snap sound
    sound.Volume = 0.8
    sound.Parent = SoundService
    sound:Play()
    sound.Ended:Connect(function() sound:Destroy() end)
end

-- Create ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "GrammarTowerGui"
screenGui.ResetOnSpawn = false
screenGui.Parent = PlayerGui

-- Top Status Bar (Height + Lava Distance)
local statusFrame = Instance.new("Frame")
statusFrame.Size = UDim2.new(0, 320, 0, 50)
statusFrame.Position = UDim2.new(0.5, -160, 0, 20)
statusFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 25)
statusFrame.BackgroundTransparency = 0.2
statusFrame.BorderSizePixel = 0
statusFrame.Parent = screenGui

local statusCorner = Instance.new("UICorner")
statusCorner.CornerRadius = UDim.new(0, 12)
statusCorner.Parent = statusFrame

local heightLabel = Instance.new("TextLabel")
heightLabel.Size = UDim2.new(0.5, 0, 1, 0)
heightLabel.Position = UDim2.new(0, 10, 0, 0)
heightLabel.BackgroundTransparency = 1
heightLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
heightLabel.Text = "HEIGHT: 2 / 100m"
heightLabel.Font = Enum.Font.GothamBold
heightLabel.TextSize = 15
heightLabel.TextXAlignment = Enum.TextXAlignment.Left
heightLabel.Parent = statusFrame

local lavaLabel = Instance.new("TextLabel")
lavaLabel.Size = UDim2.new(0.5, 0, 1, 0)
lavaLabel.Position = UDim2.new(0.5, 0, 0, 0)
lavaLabel.BackgroundTransparency = 1
lavaLabel.TextColor3 = Color3.fromRGB(255, 100, 50)
lavaLabel.Text = "LAVA RISING!"
lavaLabel.Font = Enum.Font.GothamBold
lavaLabel.TextSize = 14
lavaLabel.Parent = statusFrame

-- Center Bottom Question Card
local questionCard = Instance.new("Frame")
questionCard.Size = UDim2.new(0, 520, 0, 160)
questionCard.Position = UDim2.new(0.5, -260, 1, -180)
questionCard.BackgroundColor3 = Color3.fromRGB(25, 25, 30)
questionCard.BackgroundTransparency = 0.1
questionCard.BorderSizePixel = 0
questionCard.Parent = screenGui

local cardCorner = Instance.new("UICorner")
cardCorner.CornerRadius = UDim.new(0, 16)
cardCorner.Parent = questionCard

local cardStroke = Instance.new("UIStroke")
cardStroke.Color = Color3.fromRGB(255, 160, 0)
cardStroke.Thickness = 2
cardStroke.Parent = questionCard

local categoryLabel = Instance.new("TextLabel")
categoryLabel.Size = UDim2.new(1, -20, 0, 25)
categoryLabel.Position = UDim2.new(0, 10, 0, 8)
categoryLabel.BackgroundTransparency = 1
categoryLabel.TextColor3 = Color3.fromRGB(255, 200, 50)
categoryLabel.Text = "GRAMMAR CHALLENGE"
categoryLabel.Font = Enum.Font.GothamBold
categoryLabel.TextSize = 13
categoryLabel.Parent = questionCard

local promptLabel = Instance.new("TextLabel")
promptLabel.Size = UDim2.new(1, -20, 0, 45)
promptLabel.Position = UDim2.new(0, 10, 0, 32)
promptLabel.BackgroundTransparency = 1
promptLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
promptLabel.Text = "Loading question..."
promptLabel.Font = Enum.Font.GothamSemibold
promptLabel.TextSize = 16
promptLabel.TextWrapped = true
promptLabel.Parent = questionCard

-- Input Text Box
local inputBar = Instance.new("TextBox")
inputBar.Size = UDim2.new(0, 360, 0, 45)
inputBar.Position = UDim2.new(0, 15, 1, -60)
inputBar.BackgroundColor3 = Color3.fromRGB(15, 15, 20)
inputBar.TextColor3 = Color3.fromRGB(255, 255, 255)
inputBar.PlaceholderText = "Type your answer here..."
inputBar.Font = Enum.Font.GothamBold
inputBar.TextSize = 16
inputBar.ClearTextOnFocus = false
inputBar.Parent = questionCard

local inputCorner = Instance.new("UICorner")
inputCorner.CornerRadius = UDim.new(0, 10)
inputCorner.Parent = inputBar

-- Stack Button
local stackBtn = Instance.new("TextButton")
stackBtn.Size = UDim2.new(0, 115, 0, 45)
stackBtn.Position = UDim2.new(1, -130, 1, -60)
stackBtn.BackgroundColor3 = Color3.fromRGB(230, 60, 30)
stackBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
stackBtn.Text = "STACK! ↵"
stackBtn.Font = Enum.Font.GothamBlack
stackBtn.TextSize = 16
stackBtn.Parent = questionCard

local btnCorner = Instance.new("UICorner")
btnCorner.CornerRadius = UDim.new(0, 10)
btnCorner.Parent = stackBtn

-- Question State
local currentQuestionIndex = 1
local currentQuestion = nil

local function loadQuestion(index)
    currentQuestion = GrammarQuestions[index]
    if not currentQuestion then
        currentQuestionIndex = 1
        currentQuestion = GrammarQuestions[1]
    end
    categoryLabel.Text = string.upper(currentQuestion.category)
    promptLabel.Text = currentQuestion.prompt
    inputBar.Text = ""
    inputBar:CaptureFocus()
end

local function submitCurrentAnswer()
    local text = inputBar.Text
    if #text == 0 or not currentQuestion then return end

    local response = SubmitAnswerRemote:InvokeServer(currentQuestion.id, text)
    if response and response.success then
        if response.isCorrect then
            playSlamSound()
            heightLabel.Text = "HEIGHT: " .. tostring(response.newHeight) .. " / 100m"
            currentQuestionIndex = currentQuestionIndex + 1
            loadQuestion(currentQuestionIndex)
        else
            promptLabel.Text = "INCORRECT! Correct answer was: " .. tostring(response.correctAnswer)
            task.wait(1.5)
            currentQuestionIndex = currentQuestionIndex + 1
            loadQuestion(currentQuestionIndex)
        end
    end
end

stackBtn.MouseButton1Click:Connect(submitCurrentAnswer)
inputBar.FocusLost:Connect(function(enterPressed)
    if enterPressed then
        submitCurrentAnswer()
    end
end)

-- Lava Distance Sync
LavaSyncRemote.OnClientEvent:Connect(function(lavaY)
    local char = localPlayer.Character
    if char and char:FindFirstChild("HumanoidRootPart") then
        local playerY = char.HumanoidRootPart.Position.Y
        local diff = math.max(0, math.floor(playerY - lavaY))
        lavaLabel.Text = "LAVA: " .. tostring(diff) .. " STUDS"
        if diff < 10 then
            lavaLabel.TextColor3 = Color3.fromRGB(255, 30, 30)
        else
            lavaLabel.TextColor3 = Color3.fromRGB(255, 120, 50)
        end
    end
end)

-- Victory Fanfare
VictoryRemote.OnClientEvent:Connect(function(winnerName, height)
    promptLabel.Text = "🏆 " .. winnerName .. " WON THE TOWER RACE (" .. height .. "m)!"
    categoryLabel.Text = "VICTORY!"
end)

-- Initialize First Question
task.wait(1)
loadQuestion(1)
