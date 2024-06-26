import { IsEmail, IsISO8601, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  UserCreateInputDTO,
  UserOutputDTO,
  UserOutputWithRolesDTO,
  UserService,
  UserUpdateDTO,
} from '../service/UserService.js';
import { AuthenticatedRequest, AuthService, LoginOutputDTO } from '../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res, Param } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId, ParamIdAndRoleId } from '../lib/validators.js';
import { Request, Response } from 'express';
import { PERMISSIONS } from '@takaro/auth';
import { RangeFilterCreatedAndUpdatedAt } from './shared.js';
import { DomainOutputDTO, DomainService } from '../service/DomainService.js';
import { TakaroDTO } from '@takaro/util';
import { config } from '../config.js';

export class GetUserDTO {
  @Length(3, 50)
  name!: string;
}

export class LoginDTO {
  @Length(3, 50)
  username!: string;

  @Length(8, 50)
  password!: string;
}

export class InviteCreateDTO {
  @IsString()
  @IsEmail()
  email!: string;
}

class UserRoleAssignChangeDTO {
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}

class LoginOutputDTOAPI extends APIOutput<LoginOutputDTO> {
  @Type(() => LoginOutputDTO)
  @ValidateNested()
  declare data: LoginOutputDTO;
}

class MeOutoutDTO extends TakaroDTO<MeOutoutDTO> {
  @Type(() => UserOutputWithRolesDTO)
  @ValidateNested()
  user: UserOutputWithRolesDTO;

  @Type(() => DomainOutputDTO)
  @ValidateNested({ each: true })
  domains: DomainOutputDTO[];
}

class MeOutoutDTOAPI extends APIOutput<MeOutoutDTO> {
  @Type(() => MeOutoutDTO)
  @ValidateNested()
  declare data: MeOutoutDTO;
}

class UserOutputDTOAPI extends APIOutput<UserOutputWithRolesDTO> {
  @Type(() => UserOutputWithRolesDTO)
  @ValidateNested()
  declare data: UserOutputWithRolesDTO;
}

class UserOutputArrayDTOAPI extends APIOutput<UserOutputWithRolesDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => UserOutputWithRolesDTO)
  declare data: UserOutputWithRolesDTO[];
}

class UserSearchInputAllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsString({ each: true })
  idpId!: string[];

  @IsOptional()
  @IsString({ each: true })
  discordId!: string[];
}

class UserSearchInputAllowedRangeFilter extends RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsISO8601()
  lastSeen!: string;
}

class UserSearchInputDTO extends ITakaroQuery<UserOutputDTO> {
  @ValidateNested()
  @Type(() => UserSearchInputAllowedFilters)
  declare filters: UserSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => UserSearchInputAllowedFilters)
  declare search: UserSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => UserSearchInputAllowedRangeFilter)
  declare greaterThan: UserSearchInputAllowedRangeFilter;

  @ValidateNested()
  @Type(() => UserSearchInputAllowedRangeFilter)
  declare lessThan: UserSearchInputAllowedRangeFilter;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class UserController {
  @Post('/login')
  @ResponseSchema(LoginOutputDTOAPI)
  async login(@Body() loginReq: LoginDTO) {
    return apiResponse(await AuthService.login(loginReq.username, loginReq.password));
  }

  @Post('/logout')
  @ResponseSchema(APIOutput)
  async logout(@Req() req: Request) {
    return apiResponse(await AuthService.logout(req));
  }

  @Get('/me')
  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(MeOutoutDTOAPI)
  @OpenAPI({
    summary: 'Get the current logged in user',
    description:
      'Get the current user and the domains that the user has access to. Note that you can only make requests in the scope of a single domain. In order to switch the domain, you need to use the domain selection endpoints',
  })
  async me(@Req() req: AuthenticatedRequest) {
    const user = await new UserService(req.domainId).findOne(req.user.id);
    const domainService = new DomainService();
    const domains = await domainService.resolveDomainByIdpId(user.idpId);
    return apiResponse({ user, domains });
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_USERS], false))
  @ResponseSchema(UserOutputArrayDTOAPI)
  @Post('/user/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: UserSearchInputDTO) {
    const service = new UserService(req.domainId);
    const result = await service.find({
      ...query,
      page: res.locals.page,
      limit: res.locals.limit,
    });
    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_USERS], false))
  @ResponseSchema(UserOutputDTOAPI)
  @Get('/user/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @ResponseSchema(UserOutputDTOAPI)
  @Post('/user')
  async create(@Req() req: AuthenticatedRequest, @Body() data: UserCreateInputDTO) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @ResponseSchema(UserOutputDTOAPI)
  @Put('/user/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: UserUpdateDTO) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/user/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new UserService(req.domainId);
    await service.delete(params.id);
    return apiResponse(new IdUuidDTO({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ROLES], false))
  @Post('/user/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async assignRole(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndRoleId,
    @Body() data: UserRoleAssignChangeDTO
  ) {
    const service = new UserService(req.domainId);
    return apiResponse(await service.assignRole(params.roleId, params.id, data.expiresAt));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ROLES], false))
  @Delete('/user/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async removeRole(@Req() req: AuthenticatedRequest, @Params() params: ParamIdAndRoleId) {
    const service = new UserService(req.domainId);
    await service.removeRole(params.roleId, params.id);
    return apiResponse(
      new IdUuidDTO({
        id: params.roleId,
      })
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_USERS], false))
  @Post('/user/invite')
  @ResponseSchema(UserOutputDTOAPI)
  async invite(@Req() req: AuthenticatedRequest, @Body() data: InviteCreateDTO) {
    const service = new UserService(req.domainId);
    const user = await service.inviteUser(data.email);
    return apiResponse(user);
  }

  @UseBefore(AuthService.getAuthMiddleware([], false))
  @Post('/selected-domain/:domainId')
  @OpenAPI({
    summary: 'Set the selected domain for the user',
    description:
      'One user can have multiple domains, this endpoint is a helper to set the selected domain for the user',
  })
  async setSelectedDomain(@Req() req: AuthenticatedRequest, @Param('domainId') domainId: string) {
    req.res?.cookie('takaro-domain', domainId, {
      sameSite: config.get('http.domainCookie.sameSite') as boolean | 'strict' | 'lax' | 'none' | undefined,
      secure: config.get('http.domainCookie.secure'),
      domain: config.get('http.domainCookie.domain'),
    });

    return apiResponse();
  }

  @Delete('/selected-domain')
  @OpenAPI({
    summary: 'Unset the selected domain for the user',
    description:
      'Unset the selected domain for the user, this will clear the domain cookie. On the next request, the backend will set this again.',
  })
  async deleteSelectedDomainCookie(@Req() req: AuthenticatedRequest) {
    req.res?.clearCookie('takaro-domain', {
      sameSite: config.get('http.domainCookie.sameSite') as boolean | 'strict' | 'lax' | 'none' | undefined,
      secure: config.get('http.domainCookie.secure'),
      domain: config.get('http.domainCookie.domain'),
    });

    return apiResponse();
  }
}
