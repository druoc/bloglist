const { dummy, totalLikes } = require("../utils/list_helper");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../index");
const api = supertest(app);
const Blog = require("../models/blog");

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

test("dummy returns 1", () => {
  const blogs = [];
  const result = dummy(blogs);
  expect(result).toBe(1);
});

describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
  ];
  test("when list has only one blog, equals the likes of that", () => {
    const result = totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });
  test("when no blogs in list, return 0", () => {
    const listWithNoBlogs = [];
    const result = totalLikes(listWithNoBlogs);
    expect(result).toBe(0);
  });
  test("where there are multiple blogs, correct amount of likes are returned", () => {
    const listWithBlogs = [
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0,
      },
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 15,
        __v: 0,
      },
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 8,
        __v: 0,
      },
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 12,
        __v: 0,
      },
    ];
    const result = totalLikes(listWithBlogs);
    expect(result).toBe(40);
  });
});

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
  afterAll(async () => {
    await mongoose.connection.close();
  });
});

describe.only("API POST requests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObj = new Blog(initialBlogs[0]);
    await blogObj.save();
    blogObj = new Blog(initialBlogs[1]);
    await blogObj.save();
  });
  test("a POST request to /api/blogs returns a 201 status", async () => {
    await api.post("/api/blogs").expect(201);
  });
  test("a POST request to /api/blogs creates a new blog post in the database", async () => {
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
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
