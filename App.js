import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  PanResponder,
  View,
  Easing,
  Text,
  StyleSheet,
} from "react-native";
import icons from "./icons";

const CIRCLE_WIDTH = "100";
const ICONS_LENGTH = icons.length;

const Container = styled.View`
  position: relative;
  background-color: #09b0b6;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Quiz = styled(Animated.createAnimatedComponent(View))`
  flex: 1;
  width: 100%;
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;

const WordContainer = styled(Animated.createAnimatedComponent(View))`
  /* position: relative; */
  width: ${CIRCLE_WIDTH}px;
  height: ${CIRCLE_WIDTH}px;
  justify-content: center;
  align-items: center;
`;

const WordBg = styled(Animated.createAnimatedComponent(View))`
  background-color: gray;
  width: 100%;
  height: 100%;
  border-radius: 50px;
`;

const Word = styled(Animated.createAnimatedComponent(Text))`
  position: absolute;
  color: white;
  font-size: 25px;
  font-weight: 800;
`;

const Answer = styled(Animated.createAnimatedComponent(View))`
  position: absolute;
  background-color: white;
  width: ${CIRCLE_WIDTH}px;
  height: ${CIRCLE_WIDTH}px;
  border-radius: 50px;
`;

export default function App() {
  // Values
  const position = useRef(new Animated.ValueXY()).current;
  const wordBgScale = useRef(new Animated.Value(0)).current;
  const wordBgOpacity = useRef(new Animated.Value(0)).current;
  const wordScale = useRef(new Animated.Value(1)).current;

  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(1)).current;

  // Animations
  const wordBgScaleIn = Animated.timing(wordBgScale, {
    toValue: 1,
    duration: 500,
    delay: 1000,
    useNativeDriver: true,
  });
  const wordBgScaleOut = Animated.timing(wordBgScale, {
    toValue: 0,
    duration: 500,
    useNativeDriver: true,
  });
  const wordBgFadeIn = Animated.timing(wordBgOpacity, {
    toValue: 0.3,
    duration: 500,
    delay: 1000,
    easing: Easing.bounce,
    useNativeDriver: true,
  });
  const wordBgFadeOut = Animated.timing(wordBgOpacity, {
    toValue: 0,
    duration: 500,
    easing: Easing.bounce,
    useNativeDriver: true,
  });
  const wordScaleOut = Animated.spring(wordScale, {
    toValue: 0.5,
    useNativeDriver: true,
  });
  const checkScaleOne = Animated.spring(checkScale, {
    toValue: 3,
    easing: Easing.bounce,
    useNativeDriver: true,
  });
  const checkScaleTwo = Animated.timing(checkScale, {
    toValue: 20,
    useNativeDriver: true,
  });
  const checkOpacityTwo = Animated.spring(checkOpacity, {
    toValue: 0,
    useNativeDriver: true,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([wordBgScaleIn, wordBgFadeIn]),
        Animated.parallel([wordBgScaleOut, wordBgFadeOut]),
      ])
    ).start();
  }, [wordBgScale]);

  // Pan Responders
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, { dx }) => {
        wordScaleOut.start();
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
      },
      onPanResponderMove: (_, { dx, dy }) => {
        console.log(dx);
        position.setValue({
          x: dx,
          y: dy,
        });
      },
      onPanResponderRelease: () => {
        position.flattenOffset();
        // 정답이면 체크 아이콘
        Animated.sequence([
          checkScaleOne,
          Animated.parallel([checkScaleTwo, checkOpacityTwo]),
        ]).start();
        // 아니면 ??
      },
    })
  ).current;
  // State
  return (
    <Container>
      <Answer
        style={{
          opacity: checkOpacity,
          transform: [{ scale: checkScale }],
        }}
      >
        <Ionicons
          name="checkmark"
          color="green"
          size={80}
          style={{
            lineHeight: 100,
            textAlign: "center",
            fontWeight: 900,
          }}
        />
      </Answer>
      <Quiz>
        <Ionicons name={icons[1]} color="white" size={60} />
        <WordContainer
          {...panResponder.panHandlers}
          style={{ transform: position.getTranslateTransform() }}
        >
          <WordBg
            style={{
              transform: [{ scale: wordBgScale }],
              opacity: wordBgOpacity,
            }}
          />
          <Word style={{ transform: [{ scale: wordScale }] }}>단어</Word>
        </WordContainer>
        <Ionicons name="pizza" color="white" size={60} />
      </Quiz>
    </Container>
  );
}
