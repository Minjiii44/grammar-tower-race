--[[
    ========================================================================
    GRAMMAR TOWER: COMPLETE ONE-CLICK BUILDER FOR ROBLOX STUDIO
    ========================================================================
    INSTRUCTIONS:
    1. Open Roblox Studio with a Baseplate template.
    2. Open the "Command Bar" (View -> Command Bar) at the bottom of the screen.
    3. Paste this ENTIRE script into the Command Bar and press ENTER.
    
    This script will automatically:
    - Build the dark volcanic caldera with basalt rock pillars & atmospheric fog.
    - Setup studio lighting, bloom, and glowing molten magma lake.
    - Install all game scripts, question databases, and remote events.
    - Install the polished, high-fidelity UI matching the preview!
    ========================================================================
]]

local Workspace = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local StarterPlayer = game:GetService("StarterPlayer")
local StarterPlayerScripts = StarterPlayer:WaitForChild("StarterPlayerScripts")
local SoundService = game:GetService("SoundService")

print("🌋 Building Grammar Tower Volcanic Arena...")

-- 1. ATMOSPHERIC VOLCANIC LIGHTING & SKY
Lighting.ClockTime = 18.8 -- Sunset/Twilight
Lighting.OutdoorAmbient = Color3.fromRGB(45, 25, 35)
Lighting.Brightness = 1.2
Lighting.FogColor = Color3.fromRGB(24, 15, 30)
Lighting.FogStart = 25
Lighting.FogEnd = 220

-- Clean old effects
for _, effect in ipairs(Lighting:GetChildren()) do
    if effect:IsA("PostEffect") or effect:IsA("Sky") or effect:IsA("Atmosphere") then
        effect:Destroy()
    end
end

-- Add High-End Atmosphere & Bloom
local atmosphere = Instance.new("Atmosphere")
atmosphere.Density = 0.35
atmosphere.Offset = 0.25
atmosphere.Color = Color3.fromRGB(180, 80, 40)
atmosphere.Decay = Color3.fromRGB(30, 15, 35)
atmosphere.Glare = 0.2
atmosphere.Haze = 1.5
atmosphere.Parent = Lighting

local bloom = Instance.new("BloomEffect")
bloom.Intensity = 0.85
bloom.Size = 24
bloom.Threshold = 0.95
bloom.Parent = Lighting

local colorCorrection = Instance.new("ColorCorrectionEffect")
colorCorrection.Contrast = 0.15
colorCorrection.Saturation = 0.2
colorCorrection.TintColor = Color3.fromRGB(255, 235, 220)
colorCorrection.Parent = Lighting

-- 2. ARENA & BASALT ROCK PILLARS
local arenaFolder = Workspace:FindFirstChild("VolcanicArena")
if arenaFolder then arenaFolder:Destroy() end
arenaFolder = Instance.new("Folder")
arenaFolder.Name = "VolcanicArena"
arenaFolder.Parent = Workspace

-- Surrounding basalt rock pillars
local pillarCount = 18
local calderaRadius = 75
for i = 1, pillarCount do
    local angle = (i / pillarCount) * math.pi * 2
    local x = math.cos(angle) * (calderaRadius + (i % 3) * 6)
    local z = math.sin(angle) * (calderaRadius + (i % 3) * 6)
    local height = 80 + math.random(20, 50)

    local pillar = Instance.new("Part")
    pillar.Name = "BasaltPillar"
    pillar.Size = Vector3.new(14, height, 14)
    pillar.Position = Vector3.new(x, height / 2 - 10, z)
    pillar.Anchored = true
    pillar.Material = Enum.Material.Slate
    pillar.Color = Color3.fromRGB(28, 22, 32) -- Dark volcanic rock
    pillar.TopSurface = Enum.SurfaceType.Smooth
    pillar.BottomSurface = Enum.SurfaceType.Smooth
    pillar.Parent = arenaFolder
end

-- 3. RISING MOLTEN LAVA LAKE
local lavaPart = Instance.new("Part")
lavaPart.Name = "RisingLava"
lavaPart.Size = Vector3.new(400, 4, 400)
lavaPart.Position = Vector3.new(0, -6, 0)
lavaPart.Anchored = true
lavaPart.CanCollide = false
lavaPart.Material = Enum.Material.Neon
lavaPart.Color = Color3.fromRGB(255, 65, 0)
lavaPart.Parent = arenaFolder

-- Fire particle effects on lava
local fire = Instance.new("Fire")
fire.Size = 12
fire.Heat = 15
fire.Color = Color3.fromRGB(255, 140, 0)
fire.SecondaryColor = Color3.fromRGB(200, 20, 0)
fire.Parent = lavaPart

-- Lava Glow Light
local lavaLight = Instance.new("PointLight")
lavaLight.Color = Color3.fromRGB(255, 80, 20)
lavaLight.Brightness = 3
lavaLight.Range = 60
lavaLight.Parent = lavaPart

-- Lava Kill Touched Event
lavaPart.Touched:Connect(function(hit)
    local char = hit.Parent
    local hum = char:FindFirstChildOfClass("Humanoid")
    if hum and hum.Health > 0 then
        hum:TakeDamage(100) -- Classic Roblox OOF
    end
end)

-- 4. CREATE REMOTES IN REPLICATEDSTORAGE
local remotes = ReplicatedStorage:FindFirstChild("GrammarRemotes")
if not remotes then
    remotes = Instance.new("Folder")
    remotes.Name = "GrammarRemotes"
    remotes.Parent = ReplicatedStorage
end

local function ensureRemote(name, class)
    local r = remotes:FindFirstChild(name)
    if not r then
        r = Instance.new(class)
        r.Name = name
        r.Parent = remotes
    end
    return r
end

ensureRemote("SubmitAnswer", "RemoteFunction")
ensureRemote("LavaSync", "RemoteEvent")
ensureRemote("VictoryEvent", "RemoteEvent")

-- 5. WRITE QUESTION MODULE SCRIPT
local questionsModule = ReplicatedStorage:FindFirstChild("GrammarQuestions")
if questionsModule then questionsModule:Destroy() end
questionsModule = Instance.new("ModuleScript")
questionsModule.Name = "GrammarQuestions"
questionsModule.Source = [=[
local GrammarQuestions = {
    {
        id = "sva-1",
        category = "Subject-Verb Agreement",
        prompt = "Neither of the boys ___ brought his lunch today.",
        options = {"has", "have"},
        answer = "has",
        explanation = "'Neither' is grammatically singular and takes a singular verb ('has').",
        hint = "'Neither' refers to not one and not the other."
    },
    {
        id = "sva-2",
        category = "Subject-Verb Agreement",
        prompt = "The bouquet of red roses ___ a wonderful scent.",
        options = {"has", "have"},
        answer = "has",
        explanation = "The true subject is 'bouquet' (singular), not 'roses'.",
        hint = "Identify the main noun before the preposition."
    },
    {
        id = "vt-1",
        category = "Verb Tenses",
        prompt = "Yesterday afternoon, the captain ___ the bell three times.",
        options = {"rang", "rung", "ringed"},
        answer = "rang",
        explanation = "Simple past of 'ring' is 'rang'.",
        hint = "Ring -> Rang (past) -> Rung (participle)."
    },
    {
        id = "hom-1",
        category = "Homophones",
        prompt = "The students put ___ coats in the locker room.",
        options = {"their", "there", "they're"},
        answer = "their",
        explanation = "'Their' is possessive; 'there' is location; 'they're' is 'they are'.",
        hint = "Indicates ownership."
    },
    {
        id = "hom-2",
        category = "Homophones",
        prompt = "The harsh desert climate will ___ the traveler’s health.",
        options = {"affect", "effect"},
        answer = "affect",
        explanation = "'Affect' is the verb meaning to influence.",
        hint = "Remember RAVEN: Affect Verb, Effect Noun."
    },
    {
        id = "pro-1",
        category = "Pronoun Usage",
        prompt = "Between you and ___, this tower is rising very fast.",
        options = {"me", "I"},
        answer = "me",
        explanation = "'Between' is a preposition governing the objective pronoun 'me'.",
        hint = "Prepositions require objective case."
    },
    {
        id = "comp-1",
        category = "Comparatives",
        prompt = "Mount Everest is the ___ mountain on Earth.",
        options = {"highest", "higher", "most high"},
        answer = "highest",
        explanation = "Single-syllable adjectives form the superlative with -est.",
        hint = "Comparing more than two items."
    },
    {
        id = "plu-1",
        category = "Plural Nouns",
        prompt = "A pack of hungry ___ hunted across the snowy ridge.",
        options = {"wolves", "wolfs", "wolvese"},
        answer = "wolves",
        explanation = "Nouns ending in -f change to -ves in the plural.",
        hint = "Change 'f' to 'ves'."
    },
    {
        id = "apo-1",
        category = "Apostrophes",
        prompt = "The young puppy wagged ___ tail excitedly.",
        options = {"its", "it's"},
        answer = "its",
        explanation = "'Its' is possessive; 'it\\'s' means 'it is'.",
        hint = "Possessive pronouns never take an apostrophe."
    }
}
return GrammarQuestions
]=]
questionsModule.Parent = ReplicatedStorage

-- 6. WRITE SERVER SCRIPT IN SERVERSCRIPTSERVICE
local serverScript = ServerScriptService:FindFirstChild("TowerGameManager")
if serverScript then serverScript:Destroy() end
serverScript = Instance.new("Script")
serverScript.Name = "TowerGameManager"
serverScript.Source = [=[
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local remotes = ReplicatedStorage:WaitForChild("GrammarRemotes")
local SubmitAnswerRemote = remotes:WaitForChild("SubmitAnswer")
local LavaSyncRemote = remotes:WaitForChild("LavaSync")
local VictoryRemote = remotes:WaitForChild("VictoryEvent")

local GrammarQuestions = require(ReplicatedStorage:WaitForChild("GrammarQuestions"))

local TOWER_SPACING = 16
local BLOCK_HEIGHT = 3
local TARGET_HEIGHT = 100
local BASE_LAVA_SPEED = 1.0

local playerTowers = {}
local isRaceActive = false
local lavaPart = workspace:WaitForChild("VolcanicArena"):WaitForChild("RisingLava")

local function createStudBlock(pos, size)
    local block = Instance.new("Part")
    block.Size = size or Vector3.new(8, BLOCK_HEIGHT, 8)
    block.Position = pos
    block.Anchored = true
    block.Material = Enum.Material.SmoothPlastic
    block.Color = Color3.fromRGB(220, 45, 45)
    block.TopSurface = Enum.SurfaceType.Studs
    block.Parent = workspace
    return block
end

local function spawnTower(player, slot)
    local x = (slot - 1) * TOWER_SPACING - 30
    local basePos = Vector3.new(x, 0, 0)
    local base = createStudBlock(basePos, Vector3.new(10, 2, 10))
    base.Color = Color3.fromRGB(40, 40, 50)

    playerTowers[player] = {
        BasePos = basePos,
        Height = 2,
        Streak = 0,
        Score = 0
    }

    local char = player.Character or player.CharacterAdded:Wait()
    local root = char:WaitForChild("HumanoidRootPart")
    root.CFrame = CFrame.new(basePos + Vector3.new(0, 3, 0))
end

local function addBlocks(player, count)
    local data = playerTowers[player]
    if not data then return end
    local char = player.Character
    if not char then return end
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then return end

    for i = 1, count do
        local newY = data.Height + (BLOCK_HEIGHT / 2)
        local pos = Vector3.new(data.BasePos.X, newY, data.BasePos.Z)
        createStudBlock(pos)
        data.Height = data.Height + BLOCK_HEIGHT
        root.CFrame = CFrame.new(pos + Vector3.new(0, BLOCK_HEIGHT, 0))
    end

    if data.Height >= TARGET_HEIGHT then
        VictoryRemote:FireAllClients(player.Name, data.Height)
    end
end

SubmitAnswerRemote.OnServerInvoke = function(player, qId, answer)
    local data = playerTowers[player]
    if not data then return { success = false } end

    local q = nil
    for _, item in ipairs(GrammarQuestions) do
        if item.id == qId then q = item break end
    end
    if not q then return { success = false } end

    local cleanUser = string.lower(string.gsub(answer, "^%s*(.-)%s*$", "%1"))
    local cleanAnswer = string.lower(q.answer)

    if cleanUser == cleanAnswer then
        data.Streak = data.Streak + 1
        data.Score = data.Score + 100 * data.Streak
        local blocks = (data.Streak >= 3) and 2 or 1
        addBlocks(player, blocks)
        return { success = true, isCorrect = true, newHeight = data.Height, explanation = q.explanation }
    else
        data.Streak = 0
        return { success = true, isCorrect = false, correctAnswer = q.answer, explanation = q.explanation }
    end
end

local function startRace()
    isRaceActive = true
    local slot = 1
    for _, p in ipairs(Players:GetPlayers()) do
        spawnTower(p, slot)
        slot = slot + 1
    end

    local elapsed = 0
    RunService.Heartbeat:Connect(function(dt)
        if not isRaceActive or not lavaPart then return end
        elapsed = elapsed + dt
        local speed = BASE_LAVA_SPEED + (elapsed * 0.04)
        lavaPart.Position = lavaPart.Position + Vector3.new(0, speed * dt, 0)
        LavaSyncRemote:FireAllClients(lavaPart.Position.Y)
    end)
end

task.delay(2, startRace)
Players.PlayerAdded:Connect(function(p)
    p.CharacterAdded:Connect(function()
        task.wait(1)
        if playerTowers[p] then
            local d = playerTowers[p]
            local c = p.Character
            if c and c:FindFirstChild("HumanoidRootPart") then
                c.HumanoidRootPart.CFrame = CFrame.new(d.BasePos + Vector3.new(0, d.Height + 3, 0))
            end
        end
    end)
end)
]=]
serverScript.Parent = ServerScriptService

-- 7. WRITE CLIENT GUI LOCAL SCRIPT IN STARTERPLAYERSCRIPTS
local clientScript = StarterPlayerScripts:FindFirstChild("GrammarHUD")
if clientScript then clientScript:Destroy() end
clientScript = Instance.new("LocalScript")
clientScript.Name = "GrammarHUD"
clientScript.Source = [=[
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")

local localPlayer = Players.LocalPlayer
local PlayerGui = localPlayer:WaitForChild("PlayerGui")

local remotes = ReplicatedStorage:WaitForChild("GrammarRemotes")
local SubmitAnswerRemote = remotes:WaitForChild("SubmitAnswer")
local LavaSyncRemote = remotes:WaitForChild("LavaSync")
local VictoryRemote = remotes:WaitForChild("VictoryEvent")

local GrammarQuestions = require(ReplicatedStorage:WaitForChild("GrammarQuestions"))

-- Sound Effects
local function playSlam()
    local s = Instance.new("Sound")
    s.SoundId = "rbxassetid://9114223170"
    s.Volume = 0.8
    s.Parent = SoundService
    s:Play()
    s.Ended:Connect(function() s:Destroy() end)
end

-- GUI Setup
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "GrammarTowerHUD"
screenGui.ResetOnSpawn = false
screenGui.Parent = PlayerGui

-- Top Status Bar
local topBar = Instance.new("Frame")
topBar.Size = UDim2.new(0, 360, 0, 48)
topBar.Position = UDim2.new(0.5, -180, 0, 16)
topBar.BackgroundColor3 = Color3.fromRGB(18, 16, 24)
topBar.BackgroundTransparency = 0.15
topBar.BorderSizePixel = 0
topBar.Parent = screenGui

local topCorner = Instance.new("UICorner")
topCorner.CornerRadius = UDim.new(0, 12)
topCorner.Parent = topBar

local topStroke = Instance.new("UIStroke")
topStroke.Color = Color3.fromRGB(255, 140, 0)
topStroke.Thickness = 1.5
topStroke.Parent = topBar

local heightText = Instance.new("TextLabel")
heightText.Size = UDim2.new(0.5, 0, 1, 0)
heightText.Position = UDim2.new(0, 12, 0, 0)
heightText.BackgroundTransparency = 1
heightText.TextColor3 = Color3.fromRGB(255, 255, 255)
heightText.Text = "HEIGHT: 2 / 100m"
heightText.Font = Enum.Font.GothamBold
heightText.TextSize = 15
heightText.TextXAlignment = Enum.TextXAlignment.Left
heightText.Parent = topBar

local lavaText = Instance.new("TextLabel")
lavaText.Size = UDim2.new(0.5, -12, 1, 0)
lavaText.Position = UDim2.new(0.5, 0, 0, 0)
lavaText.BackgroundTransparency = 1
lavaText.TextColor3 = Color3.fromRGB(255, 80, 40)
lavaText.Text = "LAVA: 4.0m BELOW"
lavaText.Font = Enum.Font.GothamBold
lavaText.TextSize = 14
lavaText.TextXAlignment = Enum.TextXAlignment.Right
lavaText.Parent = topBar

-- Bottom Question Console
local questionBox = Instance.new("Frame")
questionBox.Size = UDim2.new(0, 520, 0, 175)
questionBox.Position = UDim2.new(0.5, -260, 1, -195)
questionBox.BackgroundColor3 = Color3.fromRGB(18, 16, 24)
questionBox.BackgroundTransparency = 0.1
questionBox.BorderSizePixel = 0
questionBox.Parent = screenGui

local boxCorner = Instance.new("UICorner")
boxCorner.CornerRadius = UDim.new(0, 16)
boxCorner.Parent = questionBox

local boxStroke = Instance.new("UIStroke")
boxStroke.Color = Color3.fromRGB(255, 170, 0)
boxStroke.Thickness = 2
boxStroke.Parent = questionBox

local categoryBadge = Instance.new("TextLabel")
categoryBadge.Size = UDim2.new(1, -24, 0, 24)
categoryBadge.Position = UDim2.new(0, 12, 0, 8)
categoryBadge.BackgroundTransparency = 1
categoryBadge.TextColor3 = Color3.fromRGB(255, 200, 50)
categoryBadge.Text = "GRAMMAR TOPIC"
categoryBadge.Font = Enum.Font.GothamBold
categoryBadge.TextSize = 13
categoryBadge.TextXAlignment = Enum.TextXAlignment.Left
categoryBadge.Parent = questionBox

local promptText = Instance.new("TextLabel")
promptText.Size = UDim2.new(1, -24, 0, 50)
promptText.Position = UDim2.new(0, 12, 0, 32)
promptText.BackgroundTransparency = 1
promptText.TextColor3 = Color3.fromRGB(255, 255, 255)
promptText.Text = "Loading question..."
promptText.Font = Enum.Font.GothamSemibold
promptText.TextSize = 16
promptText.TextWrapped = true
promptText.Parent = questionBox

local inputBar = Instance.new("TextBox")
inputBar.Size = UDim2.new(0, 350, 0, 45)
inputBar.Position = UDim2.new(0, 12, 1, -58)
inputBar.BackgroundColor3 = Color3.fromRGB(10, 8, 14)
inputBar.TextColor3 = Color3.fromRGB(255, 255, 255)
inputBar.PlaceholderText = "Type answer and press Enter..."
inputBar.Font = Enum.Font.GothamBold
inputBar.TextSize = 16
inputBar.ClearTextOnFocus = false
inputBar.Parent = questionBox

local inputCorner = Instance.new("UICorner")
inputCorner.CornerRadius = UDim.new(0, 10)
inputCorner.Parent = inputBar

local stackBtn = Instance.new("TextButton")
stackBtn.Size = UDim2.new(0, 130, 0, 45)
stackBtn.Position = UDim2.new(1, -142, 1, -58)
stackBtn.BackgroundColor3 = Color3.fromRGB(235, 60, 25)
stackBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
stackBtn.Text = "STACK! ↵"
stackBtn.Font = Enum.Font.GothamBlack
stackBtn.TextSize = 16
stackBtn.Parent = questionBox

local btnCorner = Instance.new("UICorner")
btnCorner.CornerRadius = UDim.new(0, 10)
btnCorner.Parent = stackBtn

-- Educational Toast Pill
local toast = Instance.new("TextLabel")
toast.Size = UDim2.new(0, 460, 0, 36)
toast.Position = UDim2.new(0.5, -230, 0, 75)
toast.BackgroundColor3 = Color3.fromRGB(20, 80, 40)
toast.TextColor3 = Color3.fromRGB(255, 255, 255)
toast.Text = "Correct! +Block Stacked"
toast.Font = Enum.Font.GothamBold
toast.TextSize = 13
toast.Visible = false
toast.Parent = screenGui

local toastCorner = Instance.new("UICorner")
toastCorner.CornerRadius = UDim.new(0, 10)
toastCorner.Parent = toast

-- Game Loop
local qIdx = 1
local curQ = nil

local function showQ(idx)
    curQ = GrammarQuestions[idx]
    if not curQ then
        qIdx = 1
        curQ = GrammarQuestions[1]
    end
    categoryBadge.Text = string.upper(curQ.category)
    promptText.Text = curQ.prompt
    inputBar.Text = ""
    inputBar:CaptureFocus()
end

local function submit()
    local text = inputBar.Text
    if #text == 0 or not curQ then return end

    local res = SubmitAnswerRemote:InvokeServer(curQ.id, text)
    if res and res.success then
        if res.isCorrect then
            playSlam()
            heightText.Text = "HEIGHT: " .. tostring(res.newHeight) .. " / 100m"
            toast.Text = "✓ CORRECT! " .. tostring(res.explanation)
            toast.BackgroundColor3 = Color3.fromRGB(20, 90, 40)
            toast.Visible = true
            task.delay(3, function() toast.Visible = false end)
            qIdx = qIdx + 1
            showQ(qIdx)
        else
            toast.Text = "✗ WRONG! Answer was: " .. tostring(res.correctAnswer)
            toast.BackgroundColor3 = Color3.fromRGB(120, 25, 25)
            toast.Visible = true
            task.delay(3, function() toast.Visible = false end)
            qIdx = qIdx + 1
            showQ(qIdx)
        end
    end
end

stackBtn.MouseButton1Click:Connect(submit)
inputBar.FocusLost:Connect(function(enter)
    if enter then submit() end
end)

LavaSyncRemote.OnClientEvent:Connect(function(lavaY)
    local char = localPlayer.Character
    if char and char:FindFirstChild("HumanoidRootPart") then
        local pY = char.HumanoidRootPart.Position.Y
        local dist = math.max(0, math.floor(pY - lavaY))
        lavaText.Text = "LAVA: " .. tostring(dist) .. " STUDS"
        if dist < 12 then
            lavaText.TextColor3 = Color3.fromRGB(255, 30, 30)
        else
            lavaText.TextColor3 = Color3.fromRGB(255, 120, 40)
        end
    end
end)

VictoryRemote.OnClientEvent:Connect(function(winner, h)
    promptText.Text = "🏆 " .. winner .. " WON THE RACE (" .. h .. "m)!"
    categoryBadge.Text = "VICTORY!"
end)

task.wait(1)
showQ(1)
]=]
clientScript.Parent = StarterPlayerScripts

print("✅ SUCCESS! Volcanic arena, lighting, lava lake, scripts, and UI built!")
print("🎮 Press PLAY in Roblox Studio to test your game!")
