import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import {
  CUSTOM_ID,
  UTILITY_NONE_ID,
  characters,
  killTypeOptions,
  utilityIcons,
} from "../data/assets";
import type { KillType, KillfeedConfig, Side } from "../types";
import ImageUploadField from "./ImageUploadField";

interface KillfeedControlsProps {
  config: KillfeedConfig;
  onChange: (next: KillfeedConfig) => void;
}

function revokeIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export default function KillfeedControls({
  config,
  onChange,
}: KillfeedControlsProps) {
  const patch = (partial: Partial<KillfeedConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: { xs: "100%", md: 320 },
        flexShrink: 0,
        maxHeight: { md: "calc(100vh - 120px)" },
        overflow: "visible",
        pr: 0.5,
      }}
    >
      <Typography variant="subtitle1" fontWeight={600}>
        Controls
      </Typography>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          display="block"
        >
          Side
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={config.side}
          onChange={(_, value: Side | null) => {
            if (value) patch({ side: value });
          }}
        >
          <ToggleButton value="enemy">Enemy</ToggleButton>
          <ToggleButton value="ally">Ally</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          display="block"
        >
          Kill count: {config.killCount}
          {config.killCount === 1 ? " (flag hidden)" : ""}
        </Typography>
        <Slider
          min={1}
          max={6}
          step={1}
          marks
          value={config.killCount}
          onChange={(_, value) => patch({ killCount: value as number })}
          valueLabelDisplay="auto"
        />
      </Box>

      <Divider />

      <Typography variant="subtitle2" fontWeight={600}>
        Player 1 (killer)
      </Typography>

      <FormControl fullWidth size="small">
        <InputLabel id="char1-label">Character</InputLabel>
        <Select
          labelId="char1-label"
          label="Character"
          value={config.character1}
          onChange={(e) => {
            const next = e.target.value;
            if (next !== CUSTOM_ID) {
              revokeIfBlob(config.customCharacter1);
              patch({ character1: next, customCharacter1: null });
            } else {
              patch({ character1: next });
            }
          }}
        >
          {characters.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.label}
            </MenuItem>
          ))}
          <MenuItem value={CUSTOM_ID}>Custom</MenuItem>
        </Select>
      </FormControl>

      {config.character1 === CUSTOM_ID && (
        <ImageUploadField
          label="Custom character icon"
          value={config.customCharacter1}
          onChange={(url) => patch({ customCharacter1: url })}
        />
      )}

      <TextField
        label="Nickname"
        size="small"
        fullWidth
        value={config.nickname1}
        onChange={(e) => patch({ nickname1: e.target.value })}
      />

      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={config.player1You}
            onChange={(e) => patch({ player1You: e.target.checked })}
          />
        }
        label="You"
      />

      <Divider />

      <Typography variant="subtitle2" fontWeight={600}>
        Player 2 (victim)
      </Typography>

      <FormControl fullWidth size="small">
        <InputLabel id="char2-label">Character</InputLabel>
        <Select
          labelId="char2-label"
          label="Character"
          value={config.character2}
          onChange={(e) => {
            const next = e.target.value;
            if (next !== CUSTOM_ID) {
              revokeIfBlob(config.customCharacter2);
              patch({ character2: next, customCharacter2: null });
            } else {
              patch({ character2: next });
            }
          }}
        >
          {characters.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.label}
            </MenuItem>
          ))}
          <MenuItem value={CUSTOM_ID}>Custom</MenuItem>
        </Select>
      </FormControl>

      {config.character2 === CUSTOM_ID && (
        <ImageUploadField
          label="Custom character icon"
          value={config.customCharacter2}
          onChange={(url) => patch({ customCharacter2: url })}
        />
      )}

      <TextField
        label="Nickname"
        size="small"
        fullWidth
        value={config.nickname2}
        onChange={(e) => patch({ nickname2: e.target.value })}
      />

      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={config.player2You}
            onChange={(e) => patch({ player2You: e.target.checked })}
          />
        }
        label="You"
      />

      <Divider />

      <FormControl fullWidth size="small">
        <InputLabel id="utility-label">Utility Icon</InputLabel>
        <Select
          labelId="utility-label"
          label="Utility Icon"
          value={config.utilityIcon}
          onChange={(e) => {
            const next = e.target.value;
            if (next !== CUSTOM_ID) {
              revokeIfBlob(config.customUtilityIcon);
              patch({ utilityIcon: next, customUtilityIcon: null });
            } else {
              patch({ utilityIcon: next });
            }
          }}
        >
          <MenuItem value={UTILITY_NONE_ID}>
            <em>None</em>
          </MenuItem>
          {utilityIcons.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.label}
            </MenuItem>
          ))}
          <MenuItem value={CUSTOM_ID}>Custom</MenuItem>
        </Select>
      </FormControl>

      {config.utilityIcon === CUSTOM_ID && (
        <ImageUploadField
          label="Custom utility icon"
          value={config.customUtilityIcon}
          onChange={(url) => patch({ customUtilityIcon: url })}
        />
      )}

      <FormControl fullWidth size="small">
        <InputLabel id="killtype-label">Kill Type</InputLabel>
        <Select
          labelId="killtype-label"
          label="Kill Type"
          value={config.killType}
          onChange={(e) => patch({ killType: e.target.value as KillType })}
        >
          {killTypeOptions.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
