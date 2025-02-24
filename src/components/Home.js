import React from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxW="container.md" centerContent>
      <Box textAlign="center" py={10}>
        <VStack spacing={5}>
          <Heading as="h1" size="2xl">
            Welcome to AI Chat
          </Heading>
          <Text fontSize="xl">
            Start a conversation with our AI assistant
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => navigate('/chat')}
          >
            Start Chatting
          </Button>
        </VStack>
      </Box>
    </Container>
  );
}

export default Home; 