import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Power } from "lucide-react";
import { ref, set, onValue } from "firebase/database";
import { database } from "../../firebase/config";
import { motion } from "framer-motion";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [panelControls, setPanelControls] = useState<Record<string, PanelControls>>({
    panel1: { power: false, red: 0, green: 0, blue: 0, brightness: 50 },
    panel2: { power: false, red: 0, green: 0, blue: 0, brightness: 50 },
    panel3: { power: false, red: 0, green: 0, blue: 0, brightness: 50 },
    panel4: { power: false, red: 0, green: 0, blue: 0, brightness: 50 },
  });

  const [panelToSync, setPanelToSync] = useState("panel1");

  useEffect(() => {
    const controlsRef = ref(database, "panels");
    onValue(controlsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPanelControls(data);
      }
    });
  }, []);

  const updateControl = (panelId: string, control: string, value: any) => {
    const newPanelState = {
      ...panelControls[panelId],
      [control]: value,
    };

    set(ref(database, `panels/${panelId}`), newPanelState);

    setPanelControls((prev) => ({
      ...prev,
      [panelId]: newPanelState,
    }));
  };

  const applyPreset = (preset: "warm" | "cool" | "reading" | "party") => {
    const presets: Record<string, PanelControls> = {
      warm: { power: true, red: 255, green: 244, blue: 229, brightness: 80 },
      cool: { power: true, red: 200, green: 220, blue: 255, brightness: 90 },
      reading: { power: true, red: 255, green: 255, blue: 200, brightness: 70 },
      party: { power: true, red: 180, green: 0, blue: 255, brightness: 100 },
    };

    const selected = presets[preset];

    Object.keys(panelControls).forEach((panelId) => {
      set(ref(database, `panels/${panelId}`), selected);
    });

    setPanelControls({
      panel1: { ...selected },
      panel2: { ...selected },
      panel3: { ...selected },
      panel4: { ...selected },
    });
  };

  const syncAllPanels = () => {
    const panelStateToSync = panelControls[panelToSync];

    Object.keys(panelControls).forEach((panelId) => {
      set(ref(database, `panels/${panelId}`), panelStateToSync);
    });

    setPanelControls({
      panel1: { ...panelStateToSync },
      panel2: { ...panelStateToSync },
      panel3: { ...panelStateToSync },
      panel4: { ...panelStateToSync },
    });
  };

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  const renderPanel = (panelId: string) => {
    const panel = panelControls[panelId];
    if (!panel) return <div>Loading...</div>;

    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Panel {panelId.slice(-1)}
        </h2>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => updateControl(panelId, "power", !panel.power)}
          className={`flex items-center justify-center w-full px-4 py-3 rounded-lg mb-6 transition-colors duration-200 ease-in-out ${
            panel.power
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          <Power className="w-5 h-5 mr-2" />
          {panel.power ? "Turn Off" : "Turn On"}
        </motion.button>

        <div className="space-y-6">
          {["red", "green", "blue", "brightness"].map((color) => (
            <div key={color}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {color}
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {panel[color as keyof PanelControls]}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={color === "brightness" ? "100" : "255"}
                value={panel[color as keyof PanelControls]}
                onChange={(e) =>
                  updateControl(panelId, color, parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-800 dark:text-white">
          Smart Home Panel
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-red-500 hover:text-red-700"
        >
          <LogOut className="w-5 h-5 mr-1" /> Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Preset Buttons */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Lighting Presets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => applyPreset("warm")}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-xl transition-all"
              >
                Warm Light
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => applyPreset("cool")}
                className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl transition-all"
              >
                Cool Light
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => applyPreset("reading")}
                className="bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-xl transition-all"
              >
                Reading Light
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => applyPreset("party")}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-all"
              >
                Party Mode
              </motion.button>
            </div>
          </div>

          {/* Sync Button */}
          <div className="mb-2"> {/* Reduced margin-bottom */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Select Panel to Sync
            </h3>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={syncAllPanels}
              className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-xl transition-all"
            >
              Sync All Panels to Panel 1
            </motion.button>
          </div>

          {/* Panel Selection Dropdown */}
          <div className="mb-6"> {/* You can adjust this as well if necessary */}
            <select
              onChange={(e) => setPanelToSync(e.target.value)}
              className="w-full md:w-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl py-2 px-4 transition-all"
            >
              <option value="panel1">Panel 1</option>
              <option value="panel2">Panel 2</option>
              <option value="panel3">Panel 3</option>
              <option value="panel4">Panel 4</option>
            </select>
          </div>

          {/* Panel Controllers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderPanel("panel1")}
            {renderPanel("panel2")}
            {renderPanel("panel3")}
            {renderPanel("panel4")}
          </div>
        </div>
      </main>
    </div>
  );
}
