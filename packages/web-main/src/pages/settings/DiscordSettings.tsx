import { Fragment } from 'react';
import { Helmet } from 'react-helmet';

import { Loading, styled } from '@takaro/lib-components';
import { LoginDiscord } from 'components/DiscordSettings/LoginDiscord';
import { useDiscordGuilds } from 'queries/discord';
import { ServerCard } from 'components/DiscordSettings/ServerCard';
import { InviteCard } from 'components/DiscordSettings/InviteCard';

const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: ${({ theme }) => theme.spacing[1]};
`;

const Flex = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: ${({ theme }) => theme.spacing[1]};
`;

export const DiscordSettings = () => {
  const { data, isLoading } = useDiscordGuilds({
    sortBy: 'takaroEnabled',
    sortDirection: 'desc',
  });

  if (isLoading) return <Loading />;

  const cards = data?.map((guild) => (
    <ServerCard key={guild.id} guild={guild} />
  ));

  return (
    <Fragment>
      <Helmet>
        <title>Settings - Takaro</title>
      </Helmet>
      <Flex>
        <LoginDiscord />
        <InviteCard />
      </Flex>
      <h1> Guilds</h1>
      <List>{cards}</List>
    </Fragment>
  );
};