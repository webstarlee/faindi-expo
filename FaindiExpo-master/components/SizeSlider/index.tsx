import React, { useCallback, useState } from "react";
import RangeSliderRN from "rn-range-slider";
import { View, Text, StyleSheet } from "react-native";

import Rail from "./Rail";
import RailSelected from "./RailSelected";
import Thumb from "./Thumb";

interface SizeSliderProps {
  from: number;
  to: number;
  oldLow: number;
  oldHigh: number;
  updateFrom: (newLow: number) => void;
  updateTo: (newHigh: number) => void;
}

export default function SizeSlider({
  from,
  to,
  oldLow,
  oldHigh,
  updateFrom,
  updateTo,
}: SizeSliderProps) {
  const sizeArray = ["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];
  const [low, setLow] = useState(sizeArray[from]);
  const [high, setHigh] = useState(sizeArray[to]);

  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);

  const handleValueChange = useCallback(
    (newLow: number, newHigh: number) => {
      setLow(sizeArray[newLow]);
      updateFrom(newLow);
      setHigh(sizeArray[newHigh]);
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
          marginVertical: 10,
        }}
      >
        <View>
          <Text
            style={[
              { fontStyle: "italic" },
              { textAlign: "left", fontSize: 14, color: "#FFF" },
            ]}
          >
            Size From
          </Text>
          <Text
            style={[{ fontWeight: "bold" }, { fontSize: 18, color: "#FFF" }]}
          >
            {low}
          </Text>
        </View>
        <View>
          <Text
            style={[
              { fontStyle: "italic" },
              { textAlign: "right", fontSize: 14, color: "#FFF" },
            ]}
          >
            Size To
          </Text>
          <Text
            style={[{ fontWeight: "bold" }, { fontSize: 18, color: "#FFF" }]}
          >
            {high}
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
}

const styles = StyleSheet.create({
  slider: {
    zIndex: 99999,
  },
});
