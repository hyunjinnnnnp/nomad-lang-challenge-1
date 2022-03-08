import React, { useRef, useEffect } from "react";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Animated, PanResponder, View, Easing } from "react-native";

const CIRCLE_WIDTH = "100";

const Container = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  background-color: #09b0b6;
`;

const WordContainer = styled.View`
  position: relative;
  width: ${CIRCLE_WIDTH}px;
  height: ${CIRCLE_WIDTH}px;
  border: 1px solid red;
  justify-content: center;
  align-items: center;
`;

const WordBg = styled(Animated.createAnimatedComponent(View))`
  background-color: gray;
  width: 100%;
  height: 100%;
  border-radius: 50px;
`;

const Word = styled.Text`
  position: absolute;
  color: white;
  font-size: 25px;
  font-weight: 800;
`;

const IconContainer = styled(Animated.createAnimatedComponent(View))``;

export default function App() {
  // Values
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Animations
  const scaleIn = Animated.timing(scale, {
    toValue: 1,
    duration: 500,
    delay: 1000,
    useNativeDriver: true,
  });
  const scaleOut = Animated.timing(scale, {
    toValue: 0,
    duration: 500,
    useNativeDriver: true,
  });
  const fadeIn = Animated.timing(opacity, {
    toValue: 0.3,
    duration: 500,
    delay: 1000,
    easing: Easing.bounce,
    useNativeDriver: true,
  });
  const fadeOut = Animated.timing(opacity, {
    toValue: 0,
    duration: 500,
    easing: Easing.bounce,
    useNativeDriver: true,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([scaleIn, fadeIn]),
        Animated.parallel([scaleOut, fadeOut]),
      ])
    ).start();
  }, [scale]);
  // Pan Responders

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, { dx }) => {
        console.log("grant");
      },
      onPanResponderMove: (_, { dx }) => {
        console.log(dx);
      },
      onPanResponderRelease: () => {},
    })
  ).current;
  // State

  return (
    <Container>
      <IconContainer>
        <Ionicons name="pizza" color="white" size={60} />
      </IconContainer>
      <WordContainer {...panResponder.panHandlers}>
        <WordBg style={{ transform: [{ scale }], opacity }} />
        <Word>단어</Word>
      </WordContainer>
      <IconContainer>
        <Ionicons name="pizza" color="white" size={60} />
      </IconContainer>
    </Container>
  );
}
