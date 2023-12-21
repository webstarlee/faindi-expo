import React, { useCallback, useState } from "react";
import RangeSliderRN from "rn-range-slider";
import { View, Text, StyleSheet } from "react-native";

import Rail from "./Rail";
import RailSelected from "./RailSelected";
import Thumb from "./Thumb";

interface RangeSliderProps {
  from: number;
  to: number;
  oldLow: number;
  oldHigh: number;
  updateFrom: (newLow: number) => void;
  updateTo: (newHigh: number) => void;
}

export default function RangeSlider ({ from, to, oldLow, oldHigh, updateFrom, updateTo }: RangeSliderProps) {
  const [low, setLow] = useState(from);
  const [high, setHigh] = useState(to);

  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);

  const handleValueChange = useCallback(
    (newLow: number, newHigh: number) => {
      setLow(newLow);
      updateFrom(newLow);
      setHigh(newHigh);
      updateTo(newHigh);
    },
    [setLow, setHigh]
  );

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 10
        }}
      >
        <View>
          <Text
            style={[
              { fontStyle: "italic" },
              { textAlign: "left", fontSize: 14, color: "#FFF" }
            ]}
          >
            Price From
          </Text>
          <Text
            style={[{ fontWeight: "bold" }, { fontSize: 18, color: "#FFF" }]}
          >
            {low}€
          </Text>
        </View>
        <View>
          <Text
            style={[
              { fontStyle: "italic" },
              { textAlign: "right", fontSize: 14, color: "#FFF" }
            ]}
          >
           Price To
          </Text>
          <Text
            style={[{ fontWeight: "bold" }, { fontSize: 18, color: "#FFF" }]}
          >
            {high}€
          </Text>
        </View>
      </View>
      <RangeSliderRN
        style={styles.slider}
        min={from}
        max={to}
        step={1}
        low={oldLow}
        high={oldHigh}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        // renderLabel={renderLabel}
        // renderNotch={renderNotch}
        onValueChanged={handleValueChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
    slider: {
        zIndex: 99999
    }
})
