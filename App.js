import React, { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  PanResponder,
  View,
  Easing,
  Text,
  Dimensions,
} from "react-native";
import icons from "./icons";

const MAIN_COLOR = "#09b0b6";
const CIRCLE_WIDTH = "100";
const ICONS_LENGTH = icons.length;
const { height: WINDOW_HEIGHT } = Dimensions.get("window");
// returns random number 0 or 1
const getRandomTruthy = () => Math.floor(Math.random() * 2);
// max exclusive: should be ICONS_LENGTH + 1
const getRandomIconIndex = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const Container = styled.View`
  position: relative;
  justify-content: center;
  align-items: center;
  background-color: ${MAIN_COLOR};
  flex: 1;
`;

const Edge = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 800px;
`;

const Quiz = styled(Animated.createAnimatedComponent(View))`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
`;

const WordContainer = styled(Animated.createAnimatedComponent(View))`
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

const Checking = styled(Animated.createAnimatedComponent(View))`
  position: absolute;
  background-color: white;
  width: ${CIRCLE_WIDTH}px;
  height: ${CIRCLE_WIDTH}px;
  border-radius: 50px;
  padding: 10px;
`;

const Answer = styled(Animated.createAnimatedComponent(View))`
  position: absolute;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const AnswerIconContainer = styled(Animated.createAnimatedComponent(View))`
  background-color: white;
  border-radius: 50px;
  padding: 10px;
`;

const AnswerWord = styled(Animated.createAnimatedComponent(Text))`
  color: white;
  font-size: 25px;
  font-weight: 800;
  margin-top: 10px;
`;

export default function App() {
  // VALUES
  const [iconIndex, setIconIndex] = useState(0);
  const [randomIndex, setRandomIndex] = useState(0);
  const [randomTruthy, setRandomTruthy] = useState(0);
  const [correct, setCorrect] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const quizOpacity = useRef(new Animated.Value(1)).current;
  const wordBgScale = useRef(new Animated.Value(0)).current;
  const wordBgOpacity = useRef(new Animated.Value(0)).current;
  const wordScale = useRef(new Animated.Value(1)).current;
  // Answer Icon
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(1)).current;
  const answerIconOpacity = useRef(new Animated.Value(0)).current;
  const answerIconScale = useRef(new Animated.Value(0)).current;
  const answerWordSize = useRef(new Animated.Value(0)).current;
  const answerTranslate = useRef(new Animated.Value(0)).current;

  const getIcons = () => {
    setIconIndex((prev) => prev + 1);
    const random = getRandomTruthy();
    setRandomTruthy(random);
    const randomIcon = getRandomIconIndex(0, ICONS_LENGTH + 1);
    setRandomIndex(randomIcon);
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

  const checkScaleIn = Animated.timing(checkScale, {
    toValue: 3,
    easing: Easing.bounce,
    useNativeDriver: true,
  });
  const checkScaleMore = Animated.timing(checkScale, {
    toValue: 20,
    easing: Easing.linear,
    useNativeDriver: true,
  });
  const checkFadeOut = Animated.timing(checkOpacity, {
    toValue: 0,
    useNativeDriver: true,
  });
  const checkAnim = Animated.sequence([
    checkScaleIn,
    Animated.parallel([checkScaleMore, checkFadeOut]),
  ]);
  const answerIconScaleIn = Animated.timing(answerIconScale, {
    toValue: 3,
    easing: Easing.ease,
    useNativeDriver: true,
    duration: 100,
  });
  const answerWordScale = Animated.timing(answerWordSize, {
    toValue: 1,
    easing: Easing.ease,
    useNativeDriver: true,
    duration: 100,
  });
  const answerTranslateDown = Animated.spring(answerTranslate, {
    toValue: WINDOW_HEIGHT,
    speed: 80,
    useNativeDriver: true,
    delay: 1000,
  });

  const answerAnim = Animated.sequence([
    Animated.parallel([answerIconScaleIn, answerWordScale]),
    answerTranslateDown,
  ]);

  const resetAnswer = () => {
    answerTranslate.setValue(0);
    answerIconOpacity.setValue(0);
    answerIconScale.setValue(0);
    answerWordSize.setValue(0);
    quizOpacity.setValue(1);
  };

  const resetCheckIcon = () => {
    checkScale.setValue(0);
    checkOpacity.setValue(1);
    answerIconOpacity.setValue(1);
    answerAnim.start(resetAnswer);
  };
  const answerWordTranslate = answerWordSize.interpolate({
    inputRange: [0, 1],
    outputRange: [70, 140],
    extrapolate: "clamp",
  });

  // Pan Responders
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
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
            position.setValue({ x: 0, y: 0 });
            wordScale.setValue(1);
            return;
          }
          if (dx > -80 && dx < 80) {
            position.setValue({ x: 0, y: 0 });
            wordScale.setValue(1);
            return;
          }
          // !ramdomTruthy ??? ?????? left icon??? ??????
          if (!randomTruthy && dx < -80) {
            setCorrect(true);
            quizOpacity.setValue(0);
            checkAnim.start(resetCheckIcon);
          } else if (!randomTruthy && dx > 80) {
            setCorrect(false);
            quizOpacity.setValue(0);
            checkAnim.start(resetCheckIcon);
          }
          // ramdomTruthy ??? ?????? right icon??? ??????
          if (randomTruthy && dx > -80) {
            setCorrect(true);
            quizOpacity.setValue(0);
            checkAnim.start(resetCheckIcon);
          } else if (randomTruthy && dx < 80) {
            setCorrect(false);
            quizOpacity.setValue(0);
            checkAnim.start(resetCheckIcon);
          }

          position.setValue({ x: 0, y: 0 });
          wordScale.setValue(1);
          getIcons();
        },
      }),
    [iconIndex, randomIndex, randomTruthy, correct]
  );

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

  return (
    <Container>
      <Edge>
        <Checking
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
              lineHeight: 80,
              textAlign: "center",
              fontWeight: 900,
            }}
          />
        </Checking>
        <Answer
          style={{
            transform: [{ translateY: answerTranslate }],
          }}
        >
          <AnswerIconContainer
            style={{
              transform: [{ scale: answerIconScale }],
              opacity: answerIconOpacity,
            }}
          >
            <Ionicons
              name={icons[iconIndex - 1]}
              color={MAIN_COLOR}
              size={80}
              style={{
                lineHeight: 80,
                textAlign: "center",
                fontWeight: 900,
              }}
            />
          </AnswerIconContainer>
          <AnswerWord
            style={{
              opacity: answerIconOpacity,
              transform: [
                { scale: answerWordSize },
                { translateY: answerWordTranslate },
              ],
            }}
          >
            {icons[iconIndex - 1]}
          </AnswerWord>
        </Answer>
        <Quiz style={{ opacity: quizOpacity }}>
          <Ionicons
            name={
              !randomTruthy
                ? icons[iconIndex]
                : icons[
                    randomIndex === iconIndex ? randomIndex + 1 : randomIndex
                  ]
            }
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
      </Edge>
    </Container>
  );
}
