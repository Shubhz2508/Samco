import admin from "firebase-admin";

const serviceAccount = require("../../prod.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

interface NotificationPropsTypes {
  token: string;
  heading: string;
  subHeading: string;
  buttonText: string;
}

export const sendNotification = async (
  token: string,
  heading: string,
  subHeading: string,
  buttonText: string
) => {
  const data = await admin.messaging().sendToDevice(
    [token],
    {
      data: {
        message: JSON.stringify({
          notifee: {
            heading: heading,
            sub_heading: subHeading,
            actions: [
              {
                title: `<p style="color: #B8FF00;"><b>${buttonText}</b> </p>`,
                pressAction: { id: "Splash" },
              },
            ],
          },
        }),
      },
    },
    {
      // Required for background/quit data-only messages on iOS
      contentAvailable: true,
      // Required for background/quit data-only messages on Android
      priority: "high",
    }
  );

  console.log(data);
};