import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import type { Prisma } from '../../../../generated/prisma/client';
import { NotFoundException } from '@nestjs/common';

type CreateArg<TModel> = Prisma.Args<TModel, 'create'>;
type FindUniqueArg<TModel> = Prisma.Args<TModel, 'findUnique'>;
type FindManyArg<TModel> = Prisma.Args<TModel, 'findMany'>;
type UpdateArg<TModel> = Prisma.Args<TModel, 'update'>;
type DeleteArg<TModel> = Prisma.Args<TModel, 'delete'>;

type CreateData<TModel> =
  CreateArg<TModel> extends { data: infer TData } ? TData : never;
type UniqueWhere<TModel> =
  FindUniqueArg<TModel> extends { where: infer TWhere } ? TWhere : never;
type FindManyWhere<TModel> =
  FindManyArg<TModel> extends { where?: infer TWhere } ? TWhere : never;
type UpdateData<TModel> =
  UpdateArg<TModel> extends { data: infer TData } ? TData : never;
type IncludeArg<TArg> = TArg extends { include?: infer TInclude }
  ? TInclude
  : never;
type CreateInclude<TModel> = IncludeArg<CreateArg<TModel>>;
type FindUniqueInclude<TModel> = IncludeArg<FindUniqueArg<TModel>>;
type FindManyInclude<TModel> = IncludeArg<FindManyArg<TModel>>;
type UpdateInclude<TModel> = IncludeArg<UpdateArg<TModel>>;
type DeleteInclude<TModel> = IncludeArg<DeleteArg<TModel>>;

type CreateResult<TModel, TInclude> = Prisma.Result<
  TModel,
  { data: CreateData<TModel>; include: TInclude },
  'create'
>;
type FindUniqueResult<TModel, TInclude> = Prisma.Result<
  TModel,
  { where: UniqueWhere<TModel>; include: TInclude },
  'findUnique'
>;
type FindManyResult<TModel, TInclude> = Prisma.Result<
  TModel,
  { where?: FindManyWhere<TModel>; include: TInclude },
  'findMany'
>;
type UpdateResult<TModel, TInclude> = Prisma.Result<
  TModel,
  { where: UniqueWhere<TModel>; data: UpdateData<TModel>; include: TInclude },
  'update'
>;
type DeleteResult<TModel, TInclude> = Prisma.Result<
  TModel,
  { where: UniqueWhere<TModel>; include: TInclude },
  'delete'
>;

type PrismaDelegate = {
  create(args: unknown): unknown;
  findUnique(args: unknown): unknown;
  findMany(args?: unknown): unknown;
  update(args: unknown): unknown;
  delete(args: unknown): unknown;
};

export class BaseRepository<TModel extends PrismaDelegate> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: TModel,
  ) {}

  create<TInclude extends CreateInclude<TModel> | undefined = undefined>(
    data: CreateData<TModel>,
    include?: TInclude,
  ): Promise<CreateResult<TModel, TInclude>> {
    return this.model.create({
      data,
      include,
    } as CreateArg<TModel>) as Promise<CreateResult<TModel, TInclude>>;
  }

  findById<TInclude extends FindUniqueInclude<TModel> | undefined = undefined>(
    id: string,
    include?: TInclude,
  ): Promise<FindUniqueResult<TModel, TInclude>> {
    return this.findOne({ id } as UniqueWhere<TModel>, include);
  }

  async findByIdOrThrow<
    TInclude extends FindUniqueInclude<TModel> | undefined = undefined,
  >(
    id: string,
    include?: TInclude,
  ): Promise<FindUniqueResult<TModel, TInclude>> {
    const user = await this.findOne({ id } as UniqueWhere<TModel>, include);
    if (!user) {
      throw new NotFoundException(`User not found with ID: ${id}`);
    }
    return user;
  }

  findByClerkUserId<
    TInclude extends FindUniqueInclude<TModel> | undefined = undefined,
  >(
    clerkUserId: string,
    include?: TInclude,
  ): Promise<FindUniqueResult<TModel, TInclude>> {
    return this.findOne({ clerkUserId } as UniqueWhere<TModel>, include);
  }

  async findByClerkUserIdOrThrow<
    TInclude extends FindUniqueInclude<TModel> | undefined = undefined,
  >(
    clerkUserId: string,
    include?: TInclude,
  ): Promise<FindUniqueResult<TModel, TInclude>> {
    const record = await this.findOne(
      { clerkUserId } as UniqueWhere<TModel>,
      include,
    );
    if (!record) {
      throw new NotFoundException(
        `Record not found with clerkUserId: ${clerkUserId}`,
      );
    }
    return record;
  }

  findOne<TInclude extends FindUniqueInclude<TModel> | undefined = undefined>(
    where: UniqueWhere<TModel>,
    include?: TInclude,
  ): Promise<FindUniqueResult<TModel, TInclude>> {
    return this.model.findUnique({
      where,
      include,
    } as FindUniqueArg<TModel>) as Promise<FindUniqueResult<TModel, TInclude>>;
  }

  async findOneOrThrow<
    TInclude extends FindUniqueInclude<TModel> | undefined = undefined,
  >(
    where: UniqueWhere<TModel>,
    include?: TInclude,
  ): Promise<FindUniqueResult<TModel, TInclude>> {
    const record = await this.findOne(where, include);
    if (!record) {
      throw new NotFoundException(`Record not found`);
    }
    return record;
  }

  findAll<TInclude extends FindManyInclude<TModel> | undefined = undefined>(
    where?: FindManyWhere<TModel>,
    include?: TInclude,
  ): Promise<FindManyResult<TModel, TInclude>> {
    return this.model.findMany({
      where,
      include,
    } as FindManyArg<TModel>) as Promise<FindManyResult<TModel, TInclude>>;
  }

  update<TInclude extends UpdateInclude<TModel> | undefined = undefined>(
    id: string,
    data: UpdateData<TModel>,
    include?: TInclude,
  ): Promise<UpdateResult<TModel, TInclude>> {
    return this.model.update({
      where: { id },
      include,
      data,
    } as UpdateArg<TModel>) as Promise<UpdateResult<TModel, TInclude>>;
  }

  updateByClerkUserId<
    TInclude extends UpdateInclude<TModel> | undefined = undefined,
  >(
    clerkUserId: string,
    data: UpdateData<TModel>,
    include?: TInclude,
  ): Promise<UpdateResult<TModel, TInclude>> {
    return this.model.update({
      where: { clerkUserId } as UniqueWhere<TModel>,
      include,
      data,
    } as UpdateArg<TModel>) as Promise<UpdateResult<TModel, TInclude>>;
  }

  delete<TInclude extends DeleteInclude<TModel> | undefined = undefined>(
    id: string,
    include?: TInclude,
  ): Promise<DeleteResult<TModel, TInclude>> {
    return this.model.delete({
      where: { id },
      include,
    } as DeleteArg<TModel>) as Promise<DeleteResult<TModel, TInclude>>;
  }

  deleteByClerkUserId<
    TInclude extends DeleteInclude<TModel> | undefined = undefined,
  >(
    clerkUserId: string,
    include?: TInclude,
  ): Promise<DeleteResult<TModel, TInclude>> {
    return this.model.delete({
      where: { clerkUserId } as UniqueWhere<TModel>,
      include,
    } as DeleteArg<TModel>) as Promise<DeleteResult<TModel, TInclude>>;
  }

  softDelete<TInclude extends UpdateInclude<TModel> | undefined = undefined>(
    id: string,
    include?: TInclude,
  ): Promise<UpdateResult<TModel, TInclude>> {
    return this.model.update({
      where: { id } as UniqueWhere<TModel>,
      data: { deletedAt: new Date() } as UpdateData<TModel>,
      include,
    } as UpdateArg<TModel>) as Promise<UpdateResult<TModel, TInclude>>;
  }

  softDeleteByClerkUserId<
    TInclude extends UpdateInclude<TModel> | undefined = undefined,
  >(
    clerkUserId: string,
    include?: TInclude,
  ): Promise<UpdateResult<TModel, TInclude>> {
    return this.model.update({
      where: { clerkUserId } as UniqueWhere<TModel>,
      data: { deletedAt: new Date() } as UpdateData<TModel>,
      include,
    } as UpdateArg<TModel>) as Promise<UpdateResult<TModel, TInclude>>;
  }
}
