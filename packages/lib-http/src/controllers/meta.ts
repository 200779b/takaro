import { Controller, Get } from 'routing-controllers';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { ResponseSchema } from 'routing-controllers-openapi';
import { IsBoolean } from 'class-validator';

export class HealthOutputDTO {
  @IsBoolean()
  healthy!: boolean;
}
@Controller()
export class Meta {
  @Get('/healthz')
  @ResponseSchema(HealthOutputDTO)
  getHealth() {
    return {
      healthy: true,
    };
  }

  @Get('/openapi.json')
  async getOpenApi() {
    const {
      defaultMetadataStorage: classTransformerMeta,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('class-transformer/storage');
    const { getMetadataStorage } = await import('class-validator');

    const storage = getMetadataArgsStorage();
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
      classTransformerMetadataStorage: classTransformerMeta,
      classValidatorMetadataStorage: getMetadataStorage(),
      forbidNonWhitelisted: true,
    });

    //console.log(JSON.stringify(schemas, null, 2))

    return routingControllersToSpec(
      storage,
      {},
      {
        components: {
          schemas,
          securitySchemes: {
            adminAuth: {
              description:
                'Used for system administration, like creating or deleting domains',
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            domainAuth: {
              description:
                'Used for anything inside a domain. Players, GameServers, etc.',
              type: 'apiKey',
              in: 'cookie',
              name: 'takaro-token',
            },
          },
        },
      }
    );
  }

  @Get('/api.html')
  getOpenApiHtml() {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <script
          type="module"
          src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"
        ></script>
      </head>
      <body>
        <rapi-doc
          spec-url="/openapi.json"
          theme="dark"
          render-style="view"
          fill-request-fields-with-example="false"
          persist-auth="true"
        />
      </body>
    </html>
    `;
  }
}