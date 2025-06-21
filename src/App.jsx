import React, { useState, useEffect, useRef } from "react";

const RegexBattleArena = () => {
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [players, setPlayers] = useState({
    1: { health: 100, combo: 0 },
    2: { health: 100, combo: 0 },
  });
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [regexInput, setRegexInput] = useState("");
  const [gameLog, setGameLog] = useState([
    {
      message: "⚔️ Battle begins! Player 1's turn to attack!",
      type: "info",
      id: 0,
    },
  ]);
  const [showGuide, setShowGuide] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [logIdCounter, setLogIdCounter] = useState(1);
  const gameLogRef = useRef();

  const challenges = [
    {
      title: "Match simple words",
      description: "Match the word 'cat' exactly",
      difficulty: "easy",
      hint: "Just type: cat",
      shouldMatch: ["cat", "The cat is sleeping", "catch has cat in it"],
      shouldNotMatch: ["dog", "Car", "CAT"],
    },
    {
      title: "Match any digit",
      description: "Match any single digit (0-9)",
      difficulty: "easy",
      hint: "Use \\d or [0-9]",
      shouldMatch: ["5", "Phone: 123", "Room 9"],
      shouldNotMatch: ["abc", "no numbers", ""],
    },
    {
      title: "Match email addresses",
      description: "Create a regex pattern that matches valid email addresses",
      difficulty: "medium",
      hint: "Try: \\w+@\\w+\\.\\w+",
      shouldMatch: ["test@example.com", "user@domain.co", "a@b.c"],
      shouldNotMatch: ["invalid.email", "@domain.com", "test@", "test@.com"],
    },
    {
      title: "Match phone numbers",
      description: "Match US phone numbers in format 123-456-7890",
      difficulty: "medium",
      hint: "Try: \\d{3}-\\d{3}-\\d{4}",
      shouldMatch: ["123-456-7890", "555-123-4567", "999-888-7777"],
      shouldNotMatch: ["123-45-6789", "12-345-6789", "123 456 7890"],
    },
    {
      title: "Match HTML tags",
      description: "Match opening HTML tags like <div> and <span>",
      difficulty: "medium",
      hint: "Try: <\\w+>",
      shouldMatch: ["<div>", "<span>", "<p>", "<html>"],
      shouldNotMatch: ["<div", "div>", "<>", "</div>"],
    },
    {
      title: "Match hexadecimal colors",
      description: "Match hex color codes like #FF0000 or #abc123",
      difficulty: "medium",
      hint: "Try: #[0-9a-fA-F]+",
      shouldMatch: ["#FF0000", "#abc123", "#000", "#FFFFFF"],
      shouldNotMatch: ["FF0000", "#GG0000", "#12345", "#"],
    },
    {
      title: "Match IPv4 addresses",
      description: "Match valid IPv4 addresses like 192.168.1.1",
      difficulty: "hard",
      hint: "Try: \\d+\\.\\d+\\.\\d+\\.\\d+",
      shouldMatch: ["192.168.1.1", "10.0.0.1", "255.255.255.255"],
      shouldNotMatch: ["256.1.1.1", "192.168.1", "192.168.1.1.1"],
    },
    {
      title: "Match words with numbers",
      description: "Match words that contain at least one digit",
      difficulty: "medium",
      hint: "Try: \\w*\\d\\w*",
      shouldMatch: ["abc123", "test1", "hello2world", "9lives"],
      shouldNotMatch: ["hello", "world", "test", "abc"],
    },
    {
      title: "Match strong passwords",
      description:
        "Match passwords with at least 6 chars including letters and numbers",
      difficulty: "hard",
      hint: "Try: (?=.*[a-zA-Z])(?=.*\\d).{6,}",
      shouldMatch: ["Password1", "abc123", "Hello9"],
      shouldNotMatch: ["password", "123456", "Pass", "ab12"],
    },
  ];

  const currentChallenge = challenges[challengeIndex];

  useEffect(() => {
    if (gameLogRef.current) {
      gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight;
    }
  }, [gameLog]);

  const addLogEntry = (message, type) => {
    setGameLog((prev) => [...prev, { message, type, id: logIdCounter }]);
    setLogIdCounter((prev) => prev + 1);
  };

  const validateRegex = (pattern) => {
    try {
      let regex;

      if (pattern.startsWith("/") && pattern.lastIndexOf("/") > 0) {
        const lastSlash = pattern.lastIndexOf("/");
        const regexPattern = pattern.slice(1, lastSlash);
        const flags = pattern.slice(lastSlash + 1);
        regex = new RegExp(regexPattern, flags);
      } else {
        regex = new RegExp(pattern);
      }

      const challenge = currentChallenge;

      for (let str of challenge.shouldMatch) {
        if (!regex.test(str)) {
          return {
            isValid: false,
            error: `Pattern should match "${str}" but doesn't`,
          };
        }
      }

      for (let str of challenge.shouldNotMatch) {
        if (regex.test(str)) {
          return {
            isValid: false,
            error: `Pattern shouldn't match "${str}" but does`,
          };
        }
      }

      return { isValid: true };
    } catch (e) {
      return { isValid: false, error: `Invalid regex: ${e.message}` };
    }
  };

  const processSuccessfulAttack = () => {
    if (isPracticeMode) {
      addLogEntry(
        "🎯 Excellent! You got it right! Try the next challenge.",
        "success"
      );
      return;
    }

    const newPlayers = { ...players };
    const player = newPlayers[currentPlayer];
    player.combo++;

    const challenge = currentChallenge;
    let baseDamage =
      challenge.difficulty === "easy"
        ? 15
        : challenge.difficulty === "medium"
        ? 25
        : 35;

    const comboDamage = Math.floor(baseDamage * (1 + player.combo * 0.2));
    const opponent = currentPlayer === 1 ? 2 : 1;

    newPlayers[opponent].health = Math.max(
      0,
      newPlayers[opponent].health - comboDamage
    );

    addLogEntry(
      `🎯 Player ${currentPlayer} lands a critical hit! ${comboDamage} damage (${player.combo}x combo!)`,
      "success"
    );

    addLogEntry(`💥 Player ${opponent} takes ${comboDamage} damage!`, "damage");

    setPlayers(newPlayers);

    if (newPlayers[opponent].health <= 0) {
      setGameOver(currentPlayer);
    }
  };

  const processFailedAttack = (error) => {
    if (isPracticeMode) {
      addLogEntry(
        `❌ Not quite right: ${error}. Check the hint and try again!`,
        "failure"
      );
      return;
    }

    const newPlayers = { ...players };
    newPlayers[currentPlayer].combo = 0;
    setPlayers(newPlayers);

    addLogEntry(
      `❌ Player ${currentPlayer}'s attack failed! ${error} Combo reset.`,
      "failure"
    );
  };

  const switchTurns = () => {
    if (isPracticeMode) return;

    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setCurrentPlayer(nextPlayer);
    addLogEntry(`⚔️ Player ${nextPlayer}'s turn!`, "info");
  };

  const attack = () => {
    const pattern = regexInput.trim();

    if (!pattern) {
      addLogEntry("Enter a regex pattern to attack!", "failure");
      return;
    }

    const result = validateRegex(pattern);

    if (result.isValid) {
      processSuccessfulAttack();
    } else {
      processFailedAttack(result.error);
    }

    setRegexInput("");

    if (!isPracticeMode) {
      switchTurns();
    }
    nextChallenge();
  };

  const nextChallenge = () => {
    setChallengeIndex((prev) => (prev + 1) % challenges.length);
  };

  const togglePracticeMode = () => {
    setIsPracticeMode(!isPracticeMode);

    if (!isPracticeMode) {
      addLogEntry(
        "🎯 Practice mode activated! Learn at your own pace with hints.",
        "success"
      );
    } else {
      addLogEntry("⚔️ Battle mode activated! Time for combat!", "damage");
    }
  };

  const restartGame = () => {
    setCurrentPlayer(1);
    setPlayers({
      1: { health: 100, combo: 0 },
      2: { health: 100, combo: 0 },
    });
    setChallengeIndex(0);
    setIsPracticeMode(false);
    setRegexInput("");
    setGameLog([
      {
        message: "⚔️ Battle begins! Player 1's turn to attack!",
        type: "info",
        id: 0,
      },
    ]);
    setGameOver(null);
    setLogIdCounter(1);
  };

  const getDifficultyBadge = (difficulty) => {
    const emoji =
      difficulty === "easy" ? "🟢" : difficulty === "medium" ? "🟡" : "🔴";
    return `${emoji} ${difficulty.toUpperCase()}`;
  };

  const getHealthPercent = (playerId) => {
    return (players[playerId].health / 100) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white font-mono overflow-x-hidden">
      <style jsx>{`
        @keyframes glow {
          from {
            filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.3));
          }
          to {
            filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.6));
          }
        }
        @keyframes damage {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .title-glow {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
          animation: glow 2s ease-in-out infinite alternate;
        }
        .player-damaged {
          animation: damage 0.5s ease-in-out;
        }
        .log-entry-fade {
          animation: fadeIn 0.5s ease-in;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        .player-active {
          border-color: #00ff88 !important;
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
          transform: scale(1.02);
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-5">
        <h1 className="text-5xl font-bold text-center mb-8 title-glow">
          ⚔️ REGEX BATTLE ARENA ⚔️
        </h1>

        <div className="flex justify-center gap-5 mb-8">
          <button
            className="px-6 py-3 font-bold bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            onClick={() => setShowGuide(true)}
          >
            📚 REGEX GUIDE
          </button>
          <button
            className={`px-6 py-3 font-bold rounded-lg uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              isPracticeMode
                ? "bg-gradient-to-r from-orange-600 to-orange-400"
                : "bg-gradient-to-r from-teal-600 to-teal-400"
            }`}
            onClick={togglePracticeMode}
          >
            {isPracticeMode ? "⚔️ BATTLE MODE" : "🎯 PRACTICE MODE"}
          </button>
        </div>

        {/* Battle Arena */}
        <div className="mb-8">
          {isPracticeMode ? (
            <div className="glass-effect rounded-2xl p-6 border-teal-500">
              <h3 className="text-2xl font-bold text-teal-400 mb-4">
                🎯 Practice Mode Active
              </h3>
              <p className="mb-2">
                Learn regex patterns at your own pace! Hints are provided for
                each challenge.
              </p>
              <p>No pressure, no combat - just pure learning! 📚</p>
            </div>
          ) : (
            <div className="flex justify-between gap-5">
              {[1, 2].map((playerId) => (
                <div
                  key={playerId}
                  className={`flex-1 glass-effect rounded-2xl p-5 transition-all duration-300 ${
                    currentPlayer === playerId ? "player-active" : ""
                  }`}
                >
                  <div
                    className={`text-2xl font-bold text-center mb-3 ${
                      playerId === 1 ? "text-green-400" : "text-orange-400"
                    }`}
                  >
                    PLAYER {playerId}
                  </div>

                  <div className="relative w-full h-5 bg-black bg-opacity-30 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        playerId === 1
                          ? "bg-gradient-to-r from-green-400 to-green-600"
                          : "bg-gradient-to-r from-orange-400 to-orange-600"
                      }`}
                      style={{ width: `${getHealthPercent(playerId)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
                      {players[playerId].health} / 100
                    </div>
                  </div>

                  <div className="text-center text-lg">
                    Combo:{" "}
                    <span className="text-yellow-400 font-bold text-xl">
                      {players[playerId].combo}
                    </span>
                    x
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Challenge Section */}
        <div className="glass-effect rounded-2xl p-6 mb-5">
          <div className="text-center mb-4">
            <span
              className={`text-lg ${
                currentChallenge.difficulty === "easy"
                  ? "text-green-400"
                  : currentChallenge.difficulty === "medium"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {getDifficultyBadge(currentChallenge.difficulty)}
            </span>
          </div>

          <div className="text-xl text-yellow-400 text-center mb-4">
            {currentChallenge.title}
          </div>

          <div className="text-lg mb-4 p-4 bg-black bg-opacity-30 rounded-lg border-l-4 border-green-400">
            {currentChallenge.description}
          </div>

          <div className="mb-4">
            {currentChallenge.shouldMatch.map((str, i) => (
              <div
                key={i}
                className="inline-block m-1 px-3 py-2 rounded-full text-sm font-bold bg-green-400 bg-opacity-20 border border-green-400 text-white"
              >
                ✓ {str}
              </div>
            ))}
            {currentChallenge.shouldNotMatch.map((str, i) => (
              <div
                key={i}
                className="inline-block m-1 px-3 py-2 rounded-full text-sm font-bold bg-orange-400 bg-opacity-20 border border-orange-400 text-white"
              >
                ✗ {str}
              </div>
            ))}

            {isPracticeMode && currentChallenge.hint && (
              <div className="mt-4 p-3 bg-teal-500 bg-opacity-10 border-l-3 border-teal-400 rounded">
                <strong className="text-purple-500">💡 Hint:</strong>{" "}
                {currentChallenge.hint}
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="flex gap-3 mb-5">
          <input
            type="text"
            value={regexInput}
            onChange={(e) => setRegexInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && attack()}
            className="flex-1 p-4 text-lg bg-black bg-opacity-40 border-2 border-white border-opacity-20 rounded-lg text-white font-mono focus:outline-none focus:border-green-400 focus:shadow-lg focus:shadow-green-400/30"
            placeholder="Enter your regex pattern here... e.g., /pattern/flags"
          />
          <button
            onClick={attack}
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-400 rounded-lg text-white uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-400/40"
          >
            🗡️ ATTACK!
          </button>
        </div>

        {/* Game Log */}
        <div
          ref={gameLogRef}
          className="glass-effect rounded-lg p-5 h-48 overflow-y-auto text-sm border border-white border-opacity-10"
        >
          {gameLog.map((entry) => (
            <div
              key={entry.id}
              className={`mb-2 p-2 rounded log-entry-fade ${
                entry.type === "success"
                  ? "bg-green-400 bg-opacity-10 border-l-3 border-green-400 text-white"
                  : entry.type === "failure"
                  ? "bg-orange-400 bg-opacity-10 border-l-3 border-orange-400 text-white"
                  : entry.type === "damage"
                  ? "bg-yellow-400 bg-opacity-10 border-l-3 border-yellow-400 text-white"
                  : "text-white"
              }`}
            >
              {entry.message}
            </div>
          ))}
        </div>
      </div>

      {/* Regex Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-5">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-purple-600 shadow-2xl shadow-purple-600/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-purple-400">
                📚 Regex Survival Guide
              </h2>
              <button
                onClick={() => setShowGuide(false)}
                className="text-3xl text-white hover:bg-white hover:bg-opacity-10 p-1 rounded transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="glass-effect p-5 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-xl text-purple-300 mb-3">
                  🎯 What is Regex?
                </h3>
                <p>
                  Regular Expressions (Regex) are patterns used to match
                  character combinations in strings. Think of them as
                  super-powered search patterns that can find, validate, or
                  extract specific text.
                </p>
              </div>

              <div className="glass-effect p-5 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-xl text-purple-300 mb-3">
                  ⚡ Basic Patterns
                </h3>
                <div className="space-y-3">
                  <div className="bg-black bg-opacity-40 p-3 rounded border-l-3 border-green-400">
                    <div className="text-yellow-400 font-bold">hello</div>
                    <div className="text-green-400 italic">
                      Matches exactly "hello"
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 p-3 rounded border-l-3 border-green-400">
                    <div className="text-yellow-400 font-bold">.</div>
                    <div className="text-green-400 italic">
                      Matches any single character
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 p-3 rounded border-l-3 border-green-400">
                    <div className="text-yellow-400 font-bold">^hello</div>
                    <div className="text-green-400 italic">
                      Matches "hello" at the start of a line
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-40 p-3 rounded border-l-3 border-green-400">
                    <div className="text-yellow-400 font-bold">world$</div>
                    <div className="text-green-400 italic">
                      Matches "world" at the end of a line
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-effect p-5 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-xl text-purple-300 mb-3">
                  🔥 Character Classes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { pattern: "[abc]", desc: "Matches a, b, or c" },
                    { pattern: "[a-z]", desc: "Any lowercase letter" },
                    { pattern: "[A-Z]", desc: "Any uppercase letter" },
                    { pattern: "[0-9]", desc: "Any digit" },
                    { pattern: "\\d", desc: "Any digit (shorthand)" },
                    {
                      pattern: "\\w",
                      desc: "Any word character (a-z, A-Z, 0-9, _)",
                    },
                    { pattern: "\\s", desc: "Any whitespace character" },
                    { pattern: "[^abc]", desc: "NOT a, b, or c" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-black bg-opacity-30 p-3 rounded border-l-3 border-orange-400"
                    >
                      <div className="text-yellow-400 font-mono font-bold">
                        {item.pattern}
                      </div>
                      <div className="text-gray-300 text-sm">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-effect p-5 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-xl text-purple-300 mb-3">🎪 Quantifiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { pattern: "*", desc: "0 or more times" },
                    { pattern: "+", desc: "1 or more times" },
                    { pattern: "?", desc: "0 or 1 time (optional)" },
                    { pattern: "{3}", desc: "Exactly 3 times" },
                    { pattern: "{2,5}", desc: "Between 2 and 5 times" },
                    { pattern: "{3,}", desc: "3 or more times" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-black bg-opacity-30 p-3 rounded border-l-3 border-orange-400"
                    >
                      <div className="text-yellow-400 font-mono font-bold">
                        {item.pattern}
                      </div>
                      <div className="text-gray-300 text-sm">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-effect p-5 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-xl text-purple-300 mb-3">
                  💡 Common Examples
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      pattern: "\\w+@\\w+\\.\\w+",
                      desc: "Basic email pattern (word@word.word)",
                    },
                    {
                      pattern: "\\d{3}-\\d{3}-\\d{4}",
                      desc: "Phone number (123-456-7890)",
                    },
                    {
                      pattern: "#[0-9a-fA-F]{6}",
                      desc: "Hex color code (#FF0000)",
                    },
                    { pattern: "<\\w+>", desc: "HTML opening tag (<div>)" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-black bg-opacity-40 p-3 rounded border-l-3 border-green-400"
                    >
                      <div className="text-yellow-400 font-bold">
                        {item.pattern}
                      </div>
                      <div className="text-green-400 italic">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-effect p-5 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-xl text-purple-300 mb-3">🚀 Pro Tips</h3>
                <div className="space-y-2">
                  <p>
                    <strong>Start Simple:</strong> Begin with basic patterns and
                    build complexity gradually.
                  </p>
                  <p>
                    <strong>Test Everything:</strong> Make sure your pattern
                    matches what it should AND doesn't match what it shouldn't.
                  </p>
                  <p>
                    <strong>Escape Special Characters:</strong> Use backslash
                    (\) before special characters like . * + ? [ ] {`{`} {`}`} (
                    ) | ^
                  </p>
                  <p>
                    <strong>Practice Mode:</strong> Use practice mode to learn
                    without the pressure of combat!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-10 rounded-2xl text-center border-2 border-green-400 shadow-2xl shadow-green-400/30">
            <div className="text-5xl font-bold mb-5 bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
              🏆 PLAYER {gameOver} WINS! 🏆
            </div>
            <p className="mb-5 text-xl">Regex mastery achieved!</p>
            <button
              onClick={restartGame}
              className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-600 to-green-400 rounded-lg text-white transition-transform duration-300 hover:scale-105"
            >
              ⚔️ BATTLE AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegexBattleArena;
