import { upOne, upMany, logs, exec } from 'docker-compose';
import { OAuth2Api, Configuration } from '@ory/client';

const composeOpts = { log: true, composeOptions: ['-f', 'docker-compose.test.yml'], env: { ...process.env } };

async function main() {
  // First, start the datastores
  await upMany(['postgresql', 'redis', 'postgresql_kratos', 'postgresql_hydra'], composeOpts);

  // Then, start supporting services
  await upMany(['kratos', 'hydra'], composeOpts);

  // Check if ADMIN_CLIENT_ID and ADMIN_CLIENT_SECRET are set already
  // If not set, create them
  if (!composeOpts.env.ADMIN_CLIENT_ID || !composeOpts.env.ADMIN_CLIENT_SECRET) {
    const hydraAdmin = new OAuth2Api(
      new Configuration({
        basePath: 'http://localhost:4445',
      }));

    const { data: { client_id, client_secret } } = await hydraAdmin.createOAuth2Client({
      oAuth2Client: {
        grant_types: ['client_credentials'],
      }
    });

    console.log('Created OAuth admin client', { client_id });
    composeOpts.env.ADMIN_CLIENT_ID = client_id;
    composeOpts.env.ADMIN_CLIENT_SECRET = client_secret;
  }

  await upOne('takaro', composeOpts);

  let failed = false;

  try {
    await exec('takaro', 'npm test', composeOpts);
  } catch (error) {
    console.error('Tests failed');
    console.error(error);
    failed = true;
  }

  await logs(['postgresql', 'redis', 'takaro'], composeOpts);

  if (failed) {
    process.exit(1);
  }
}


main()
  .then(res => {
    console.log(res);
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

