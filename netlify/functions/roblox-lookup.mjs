
export default async (request) => {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") || "")
    .trim()
    .replace(/^@+/, "");

  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return Response.json(
      { error: "Please enter a valid Roblox username." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: "Roblox lookup is temporarily unavailable." },
        { status: 502 }
      );
    }

    const result = await response.json();
    const user = result.data?.[0];

    if (!user) {
      return Response.json(
        { error: "Roblox username not found." },
        { status: 404 }
      );
    }

    const avatarResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`
    );

    let avatarUrl = "";

    if (avatarResponse.ok) {
      const avatarData = await avatarResponse.json();
      avatarUrl = avatarData.data?.[0]?.imageUrl || "";
    }

    return Response.json({
      id: user.id,
      username: user.name,
      displayName: user.displayName || user.name,
      avatarUrl
    });

  } catch (error) {
    return Response.json(
      { error: "Unable to connect to Roblox. Please try again." },
      { status: 502 }
    );
  }
};
