import { PrismaService } from '@/infrastructure/prisma/prisma.service';

type CreateArg<TModel> = TModel extends { create(args: infer TArgs): unknown }
  ? TArgs
  : never;
type FindUniqueArg<TModel> = TModel extends {
  findUnique(args: infer TArgs): unknown;
}
  ? TArgs
  : never;
type FindManyArg<TModel> = TModel extends {
  findMany(args?: infer TArgs): unknown;
}
  ? TArgs
  : never;
type UpdateArg<TModel> = TModel extends { update(args: infer TArgs): unknown }
  ? TArgs
  : never;
type DeleteArg<TModel> = TModel extends { delete(args: infer TArgs): unknown }
  ? TArgs
  : never;

type CreateData<TModel> =
  CreateArg<TModel> extends { data: infer TData } ? TData : never;
type UniqueWhere<TModel> =
  FindUniqueArg<TModel> extends { where: infer TWhere } ? TWhere : never;
type FindManyWhere<TModel> =
  FindManyArg<TModel> extends { where?: infer TWhere } ? TWhere : never;
type UpdateData<TModel> =
  UpdateArg<TModel> extends { data: infer TData } ? TData : never;

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

  create(data: CreateData<TModel>) {
    return this.model.create({ data } as CreateArg<TModel>);
  }

  findById(id: string) {
    return this.model.findUnique({ where: { id } } as FindUniqueArg<TModel>);
  }

  findAll(where?: FindManyWhere<TModel>) {
    return this.model.findMany({ where } as FindManyArg<TModel>);
  }

  update(id: string, data: UpdateData<TModel>) {
    return this.model.update({
      where: { id } as UniqueWhere<TModel>,
      data,
    } as UpdateArg<TModel>);
  }

  delete(id: string) {
    return this.model.delete({ where: { id } } as DeleteArg<TModel>);
  }

  // Soft delete helper
  softDelete(id: string) {
    return this.model.update({
      where: { id } as UniqueWhere<TModel>,
      data: { deletedAt: new Date() } as UpdateData<TModel>,
    } as UpdateArg<TModel>);
  }
}
