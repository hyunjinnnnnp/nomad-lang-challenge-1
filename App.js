import React, { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Animated, PanResponder, View, Easing, Text } from "react-native";
import icons from "./icons";

const CIRCLE_WIDTH = "100";
const ICONS_LENGTH = icons.length;

// returns random number 0 or 1
const getRandomTruthy = () => Math.floor(Math.random() * 2);
// max exclusive: should be ICONS_LENGTH + 1
const getRandomIconIndex = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

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
  // VALUES
  const [iconIndex, setIconIndex] = useState(0);
  const [randomIndex, setRandomIndex] = useState(0);
  const [randomTruthy, setRandomTruthy] = useState(0);
  const [correct, setCorrect] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const wordBgScale = useRef(new Animated.Value(0)).current;
  const wordBgOpacity = useRef(new Animated.Value(0)).current;
  const wordScale = useRef(new Animated.Value(1)).current;
  // Answer Icon
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(1)).current;
  const getIcons = () => {
    setIconIndex((prev) => prev + 1);
    const random = getRandomTruthy();
    setRandomTruthy(random);
    const randomIcon = getRandomIconIndex(0, ICONS_LENGTH + 1);
    setRandomIndex(randomIcon);
  };
  const resetAnswerIcon = () => {
    checkScale.setValue(0);
    checkOpacity.setValue(1);
  };

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

  const correctAnswerAnim = Animated.sequence([
    checkScaleOne,
    Animated.parallel([checkScaleTwo, checkOpacityTwo]),
  ]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([wordBgScaleIn, wordBgFadeIn]),
        Animated.parallel([wordBgScaleOut, wordBgFadeOut]),
      ])
    ).start();
  }, [wordBgScale]);
  useEffect(() => {
    getIcons();
  }, []);

  // Pan Responders
  const panResponder = useMemo(
    () =>
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
          position.setValue({
            x: dx,
            y: dy,
          });
        },
        onPanResponderRelease: (_, { dx, dy }) => {
          position.flattenOffset();

          if (dy < -80 || dy > 80) {
            console.log("다시 해주세요");
            position.setValue({ x: 0, y: 0 });
            wordScale.setValue(1);
            return;
          }

          if (!randomTruthy) {
            // left icon 에 닿으면 정답
            if (dx < -80) {
              setCorrect(true);
              correctAnswerAnim.start(resetAnswerIcon);
            } else if (dx > 80) {
              setCorrect(false);
              correctAnswerAnim.start(resetAnswerIcon);
            }
            // right 에 닿으면 오답
          } else {
            if (dx > -80) {
              setCorrect(true);
              correctAnswerAnim.start(resetAnswerIcon);
            } else if (dx < 80) {
              setCorrect(false);
              correctAnswerAnim.start(resetAnswerIcon);
            }
          }

          position.setValue({ x: 0, y: 0 });
          wordScale.setValue(1);
          getIcons();
          console.log("NOW : ", randomTruthy);
        },
      }),
    [iconIndex, correct]
  );
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
          name={correct ? "checkmark" : "close"}
          color={correct ? "green" : "red"}
          size={80}
          style={{
            lineHeight: 100,
            textAlign: "center",
            fontWeight: 900,
          }}
        />
      </Answer>
      <Quiz>
        <Ionicons
          name={!randomTruthy ? icons[iconIndex] : icons[randomIndex]}
          color="white"
          size={60}
        />
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
          <Word style={{ transform: [{ scale: wordScale }] }}>
            {icons[iconIndex]}
          </Word>
        </WordContainer>
        <Ionicons
          name={randomTruthy ? icons[iconIndex] : icons[randomIndex]}
          color="white"
          size={60}
        />
      </Quiz>
    </Container>
  );
}
