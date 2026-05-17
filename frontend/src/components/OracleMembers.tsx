import React, { useEffect, useState } from 'react';
import { Box, VStack, Heading, Text, HStack, Code, Spinner } from '@chakra-ui/react';
import { getOracleMembers } from '../api/crediproApi';

interface OracleMember {
  id: string;
  name: string;
  publicKey: string;
}

export const OracleMembers: React.FC = () => {
  const [members, setMembers] = useState<OracleMember[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchOracleMembers = async () => {
      setLoading(true);
      try {
        const res = await getOracleMembers();
        if (!active) return;
        setMembers(res.members ?? []);
      } catch {
        // Silently fail — DefaultResolution shows an error if needed
        if (active) setMembers([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOracleMembers();
    return () => { active = false; };
  }, []);

  return (
    <Box>
      <Heading size="sm" color="white" mb={3}>Oracle Committee</Heading>
      {loading ? (
        <HStack>
          <Spinner size="sm" />
          <Text color="gray.300">Loading oracle members...</Text>
        </HStack>
      ) : members && members.length > 0 ? (
        <VStack align="stretch">
          {members.map(m => (
            <HStack key={m.id} justify="space-between" p={2} bg="rgba(255,255,255,0.02)" borderRadius="md">
              <Text color="gray.200">{m.name}</Text>
              <Code fontSize="xs">{m.publicKey.slice(0,8)}...{m.publicKey.slice(-6)}</Code>
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text color="gray.400">No oracle members available.</Text>
      )}
    </Box>
  );
};

export default OracleMembers;
