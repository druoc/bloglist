const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../index");
const api = supertest(app);
const Blog = require("../models/blog");

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
});

const initialBlogs = [
  {
    title: "Camambert Will Save All",
    author: "Arthur Smitheson",
    url: "https://google.com/cheese",
    likes: 45,
  },
  {
    title: "Vegan cheese, a modern tragedy",
    author: "Marcus Grujer",
    url: "https:cheese.com",
    likes: 54,
  },
];

describe("API GET requests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObj = new Blog(initialBlogs[0]);
    await blogObj.save();
    blogObj = new Blog(initialBlogs[1]);
    await blogObj.save();
  });
  test("GET request to /api/blogs returns a 200 status", async () => {
    await api.get("/api/blogs").expect(200);
  });

  test("GET request to /api/blogs returns the correct amount of blog posts", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(2);
  });
  test("The first blog has 45 likes", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].likes).toBe(45);
  });
  test("API returns data in JSON format", async () => {
    await api.get("/api/blogs").expect("Content-Type", /application\/json/);
  });
  test("retuned data has an id property", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });
});

describe("API POST requests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObj = new Blog(initialBlogs[0]);
    await blogObj.save();
    blogObj = new Blog(initialBlogs[1]);
    await blogObj.save();
  });

  test("a POST request to /api/blogs creates a new blog post in the database and a 201 status", async () => {
    const testBlog = {
      title: "Casu Marzu, wtf bro?",
      author: "Arthur Smitheson",
      url: "https://google.com/cheese",
      likes: 298,
    };

    const beforePostResponse = await api.get("/api/blogs");
    const beforePostLength = beforePostResponse.body.length;

    const response = await api.post("/api/blogs").send(testBlog);

    const afterPostResponse = await api.get("/api/blogs");
    const afterPostLength = afterPostResponse.body.length;

    expect(response.body.title).toBe("Casu Marzu, wtf bro?");
    expect(response.body.author).toBe("Arthur Smitheson");
    expect(response.body.url).toBe("https://google.com/cheese");
    expect(response.body.likes).toBe(298);
    expect(afterPostLength).toBe(beforePostLength + 1);
    expect(201);
  });
  test("if a POST request body is sent with no likes property, likes automatically default to 0", async () => {
    const blogWithNoLikes = {
      title: "Cheddar is boring, a controversial take",
      author: "Arthur Smitheson",
      url: "https://google.com/cheese",
    };
    const response = await api.post("/api/blogs").send(blogWithNoLikes);
    expect(response.body.likes).toEqual(0);
  });
  test("if a post request body is sent without a title property, server responds with a 400 status", async () => {
    const blogWithNoTitle = {
      author: "Reginald Toff",
      url: "google.com",
      likes: 4,
    };
    await api.post("/api/blogs").send(blogWithNoTitle).expect(400);
  });
  test("if a post request body is sent without an author property, server responds with a 400 status", async () => {
    const blogWithNoTitle = {
      title: "I like cheese",
      url: "google.com",
      likes: 4,
    };
    await api.post("/api/blogs").send(blogWithNoTitle).expect(400);
  });
  test("if a post request body is sent without a url property, server responds with a 400 status", async () => {
    const blogWithNoUrl = {
      title: "I like cheese",
      author: "Reginald Toff",
      likes: 4,
    };
    await api.post("/api/blogs").send(blogWithNoUrl).expect(400);
  });
});

describe("DELETE requests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObj = new Blog(initialBlogs[0]);
    await blogObj.save();
    blogObj = new Blog(initialBlogs[1]);
    await blogObj.save();
  });

  test.only("delete request to an existing blog returns a 204 status", async () => {
    const response = await api.get("/api/blogs");
    const id = response.body[0].id;
    await api.delete(`/api/blogs/${id}`).expect(204);
    const blogsAfterDeletion = await api.get("/api/blogs");
    expect(blogsAfterDeletion.body).toHaveLength(response.body.length - 1);
  });
});

describe.only("PATCH requests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObj = new Blog(initialBlogs[0]);
    await blogObj.save();
    blogObj = new Blog(initialBlogs[1]);
    await blogObj.save();
  });

  test("successful PATCH request returns a 200 status code and the updated resource", async () => {
    const response = await api.get("/api/blogs");
    const id = response.body[0].id;
    const likesBeforePatch = response.body[0].likes;
    const likesAmount = {
      likes: likesBeforePatch + 1,
    };

    const patchResponse = await api
      .put(`/api/blogs/${id}`)
      .send(likesAmount)
      .expect(200);

    console.log("patchResponse.body:", patchResponse.body);

    const newLikes = patchResponse.body.likes;

    expect(newLikes).toEqual(likesBeforePatch + 1);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
