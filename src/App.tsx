import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import KillfeedCanvas from "./components/KillfeedCanvas";
import KillfeedControls from "./components/KillfeedControls";
import {
  HEADSHOT_ID,
  defaultCharacter1,
  defaultCharacter2,
} from "./data/assets";
import type { KillfeedConfig } from "./types";

const initialConfig: KillfeedConfig = {
  side: "enemy",
  killCount: 1,
  character1: defaultCharacter1,
  nickname1: "Player1",
  player1You: false,
  character2: defaultCharacter2,
  nickname2: "Player2",
  player2You: false,
  utilityIcon: HEADSHOT_ID,
  killType: "final",
  customCharacter1: null,
  customCharacter2: null,
  customUtilityIcon: null,
};

export default function App() {
  const [config, setConfig] = useState<KillfeedConfig>(initialConfig);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 2, md: 4 },
        px: 2,
        background:
          "linear-gradient(160deg, #dce6f0 0%, #eef2f7 45%, #d5e0ec 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          gutterBottom
          sx={{ letterSpacing: "-0.02em", mb: 3 }}
        >
          Strinova Killfeed Generator
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <KillfeedControls config={config} onChange={setConfig} />
          <KillfeedCanvas config={config} />
        </Paper>
      </Container>
    </Box>
  );
}
