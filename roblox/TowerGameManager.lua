--[[
    ServerScriptService/TowerGameManager.lua
    Place this Script inside ServerScriptService named "TowerGameManager"
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

-- 1. Setup RemoteEvents in ReplicatedStorage
local remoteFolder = ReplicatedStorage:FindFirstChild("GrammarRemotes")
if not remoteFolder then
    remoteFolder = Instance.new("Folder")
    remoteFolder.Name = "GrammarRemotes"
    remoteFolder.Parent = ReplicatedStorage
end

local function getOrCreateRemote(name, className)
    local remote = remoteFolder:FindFirstChild(name)
    if not remote then
        remote = Instance.new(className)
        remote.Name = name
        remote.Parent = remoteFolder
    end
    return remote
end

local SubmitAnswerRemote = getOrCreateRemote("SubmitAnswer", "RemoteFunction")
local NextQuestionRemote = getOrCreateRemote("NextQuestion", "RemoteEvent")
local LavaSyncRemote = getOrCreateRemote("LavaSync", "RemoteEvent")
local VictoryRemote = getOrCreateRemote("VictoryEvent", "RemoteEvent")

-- Load Question Bank Module
local GrammarQuestions = require(ReplicatedStorage:WaitForChild("GrammarQuestions"))

-- 2. Tower & Arena Configuration
local TOWER_SPACING = 16
local BLOCK_HEIGHT = 3
local TARGET_HEIGHT = 100 -- 100 studs = Victory
local BASE_LAVA_SPEED = 1.2 -- studs per second

local playerTowers = {} -- [Player] = { BasePosition = Vector3, CurrentHeight = 0, Blocks = {} }
local isRaceActive = false
local lavaPart = nil

-- 3. Create Rising Lava Part in Workspace
local function createLava()
    if lavaPart then lavaPart:Destroy() end

    lavaPart = Instance.new("Part")
    lavaPart.Name = "RisingLava"
    lavaPart.Size = Vector3.new(500, 2, 500)
    lavaPart.Position = Vector3.new(0, -5, 0)
    lavaPart.Anchored = true
    lavaPart.CanCollide = false
    lavaPart.Material = Enum.Material.Neon
    lavaPart.Color = Color3.fromRGB(255, 60, 0)

    -- Lava Fire and Smoke particles
    local fire = Instance.new("Fire")
    fire.Size = 8
    fire.Heat = 15
    fire.Color = Color3.fromRGB(255, 120, 0)
    fire.SecondaryColor = Color3.fromRGB(255, 0, 0)
    fire.Parent = lavaPart

    -- Lava kill touch event
    lavaPart.Touched:Connect(function(hit)
        local character = hit.Parent
        local humanoid = character:FindFirstChildOfClass("Humanoid")
        if humanoid and humanoid.Health > 0 then
            humanoid:TakeDamage(100) -- Classic Roblox "OOF"
        end
    end)

    lavaPart.Parent = workspace
end

-- 4. Create Stud Brick with classic Roblox Cylinder Studs on top
local function createStudBlock(position, size)
    local block = Instance.new("Part")
    block.Size = size or Vector3.new(8, BLOCK_HEIGHT, 8)
    block.Position = position
    block.Anchored = true
    block.Material = Enum.Material.SmoothPlastic
    block.Color = Color3.fromRGB(218, 50, 50) -- Classic Roblox Red
    block.TopSurface = Enum.SurfaceType.Studs -- Authentic Roblox Studs!
    block.Parent = workspace
    return block
end

-- 5. Spawn Player Tower Base
local function spawnTowerForPlayer(player, slotIndex)
    local xOffset = (slotIndex - 1) * TOWER_SPACING - 30
    local basePos = Vector3.new(xOffset, 0, 0)

    -- Create Base Pad
    local baseBlock = createStudBlock(basePos, Vector3.new(10, 2, 10))
    baseBlock.Color = Color3.fromRGB(50, 50, 60)

    playerTowers[player] = {
        BasePosition = basePos,
        CurrentHeight = 2,
        Blocks = { baseBlock },
        Streak = 0,
        Score = 0
    }

    -- Teleport Player atop their base
    local char = player.Character or player.CharacterAdded:Wait()
    local root = char:WaitForChild("HumanoidRootPart")
    root.CFrame = CFrame.new(basePos + Vector3.new(0, 3, 0))
end

-- 6. Add Block Under Player
local function addBlockToPlayer(player, amount)
    local towerData = playerTowers[player]
    if not towerData then return end

    local char = player.Character
    if not char then return end
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then return end

    amount = amount or 1
    for i = 1, amount do
        local newY = towerData.CurrentHeight + (BLOCK_HEIGHT / 2)
        local blockPos = Vector3.new(towerData.BasePosition.X, newY, towerData.BasePosition.Z)
        local newBlock = createStudBlock(blockPos)
        table.insert(towerData.Blocks, newBlock)

        towerData.CurrentHeight = towerData.CurrentHeight + BLOCK_HEIGHT

        -- Smoothly lift character atop new block
        root.CFrame = CFrame.new(blockPos + Vector3.new(0, BLOCK_HEIGHT, 0))
    end

    -- Check Victory
    if towerData.CurrentHeight >= TARGET_HEIGHT then
        VictoryRemote:FireAllClients(player.Name, towerData.CurrentHeight)
    end
end

-- 7. Handle Answer RemoteFunction from Client
SubmitAnswerRemote.OnServerInvoke = function(player, questionId, userAnswer)
    local towerData = playerTowers[player]
    if not towerData then return { success = false } end

    -- Find Question
    local question = nil
    for _, q in ipairs(GrammarQuestions) do
        if q.id == questionId then
            question = q
            break
        end
    end
    if not question then return { success = false } end

    -- Verify answer (case-insensitive trim)
    local cleanUser = string.lower(string.gsub(userAnswer, "^%s*(.-)%s*$", "%1"))
    local cleanAnswer = string.lower(question.answer)
    local isCorrect = (cleanUser == cleanAnswer)

    if isCorrect then
        towerData.Streak = towerData.Streak + 1
        towerData.Score = towerData.Score + (100 * towerData.Streak)

        local blocksToAdd = (towerData.Streak >= 3) and 2 or 1
        addBlockToPlayer(player, blocksToAdd)

        return {
            success = true,
            isCorrect = true,
            explanation = question.explanation,
            streak = towerData.Streak,
            newHeight = towerData.CurrentHeight
        }
    else
        towerData.Streak = 0
        return {
            success = true,
            isCorrect = false,
            explanation = question.explanation,
            correctAnswer = question.answer,
            streak = 0
        }
    end
end

-- 8. Main Game Loop: Lava Rise
local function startLavaRace()
    createLava()
    isRaceActive = true

    -- Setup towers for all connected players
    local slot = 1
    for _, p in ipairs(Players:GetPlayers()) do
        spawnTowerForPlayer(p, slot)
        slot = slot + 1
    end

    -- Lava rising loop
    local elapsed = 0
    RunService.Heartbeat:Connect(function(dt)
        if not isRaceActive or not lavaPart then return end
        elapsed = elapsed + dt

        -- Speed accelerates with time
        local speed = BASE_LAVA_SPEED + (elapsed * 0.05)
        lavaPart.Position = lavaPart.Position + Vector3.new(0, speed * dt, 0)

        -- Sync with clients
        LavaSyncRemote:FireAllClients(lavaPart.Position.Y)
    end)
end

-- Initialize on server start
task.delay(3, function()
    startLavaRace()
end)

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function()
        task.wait(1)
        if playerTowers[player] then
            -- Respawn on current tower summit
            local towerData = playerTowers[player]
            local char = player.Character
            if char and char:FindFirstChild("HumanoidRootPart") then
                char.HumanoidRootPart.CFrame = CFrame.new(towerData.BasePosition + Vector3.new(0, towerData.CurrentHeight + 3, 0))
            end
        end
    end)
end)
