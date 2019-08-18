import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import {
  buildSchema,
  ObjectType,
  Field,
  Int,
  Float,
  Resolver,
  ResolverInterface,
  Query,
  Arg,
  Mutation,
  FieldResolver,
  Root
} from "type-graphql";
import path from "path";
import { plainToClass, Expose } from "class-transformer";

import { log } from "@jinhokong/common";

@ObjectType({ description: "Object representing cooking recipe" })
export class Recipe {
  @Field()
  public title!: string;

  @Field(type => String, {
    nullable: true,
    deprecationReason: "Use `description` field instead"
  })
  get specification(): string | undefined {
    return this.description;
  }

  @Field({
    nullable: true,
    description: "The recipe description with preparation info"
  })
  description?: string;

  @Field(type => [Int])
  public ratings!: number[];

  @Field()
  public creationDate!: Date;

  @Field(type => Int)
  public ratingsCount!: number;

  @Field(type => Float, { nullable: true })
  get averageRating(): number | null {
    const ratingsCount = this.ratings.length;
    if (ratingsCount === 0) {
      return null;
    }
    const ratingsSum = this.ratings.reduce((a, b) => a + b, 0);
    return ratingsSum / ratingsCount;
  }
}

const createRecipeSamples = () => {
  return plainToClass(Recipe, [
    {
      description: "Desc 1",
      title: "Recipe 1",
      ratings: [0, 3, 1],
      creationDate: new Date("2018-04-11")
    },
    {
      description: "Desc 2",
      title: "Recipe 2",
      ratings: [4, 2, 3, 1],
      creationDate: new Date("2018-04-15")
    },
    {
      description: "Desc 3",
      title: "Recipe 3",
      ratings: [5, 4],
      creationDate: new Date()
    }
  ]);
};

@Resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  private readonly items: Recipe[] = createRecipeSamples();

  @Query(returns => Recipe, { nullable: true })
  async recipe(@Arg("title") title: string): Promise<Recipe | undefined> {
    return await this.items.find(recipe => recipe.title === title);
  }

  @Query(returns => [Recipe], {
    description: "Get all the recipes from around the world "
  })
  async recipes(): Promise<Recipe[]> {
    return await this.items;
  }

  @FieldResolver()
  ratingsCount(
    @Root() recipe: Recipe,
    @Arg("minRate", type => Int, { defaultValue: 0.0 }) minRate: number
  ): number {
    return recipe.ratings.filter(rating => rating >= minRate).length;
  }
}

async function bootstrap() {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [RecipeResolver]
  });

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    // enable GraphQL Playground
    playground: true
  });

  // Start the server
  const { url } = await server.listen(4000);
  log();
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
