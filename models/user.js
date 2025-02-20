import mongoose, { SchemaTypes } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, length: 6 },
    role: {
      type: String,
      default: "employee",
      enum: ["employee", "admin", "manager", "projectLeader"],
    },
    avatar: { type: String, default: "avatar\\image-1642839181868.jpg" },
    isManager: { type: Boolean, default: false },
    payRate: { type: Number, default: 100 },
    lastActive: { type: Number, default: 0 },
    activityStatus: { type: Boolean, default: false },
    accountInfo: {
      // managerFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      ip: { type: String },
      countryName: { type: String, default: "India" },
      // add time zone as in mongo aggregation
      timeZone: { type: String, default: "IST" },
    },
    managerFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
      },
    ],
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "client",
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
      },
    ],
    status: {
      type: String,
      default: "null",
    },
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],

    config: {
      autoPauseMinutes: { type: mongoose.Schema.Types.Mixed, default: null },
      screensConfig: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      disableOfflineTime: { type: mongoose.Schema.Types.Mixed, default: null },
      disableScreenshotNotification: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      disableActivityLevel: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      currency: { type: mongoose.Schema.Types.Mixed, default: "Rs. " },
      weeklyLimit: { type: mongoose.Schema.Types.Mixed, default: null },
      weekStartDay: { type: mongoose.Schema.Types.Mixed, default: null },
      disableAppTracking: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    settings: {
      ScreenShotPerHour: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: Number, default: 6 },
        individualValue: { type: Number, default: 6 },
      },
      AllowBlur: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: Boolean, default: false },
        individualValue: { type: Boolean, default: false },
      },
      AppsAndUrlTracking: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: Boolean, default: true },
        individualValue: { type: Boolean, default: true },
      },
      WeeklyTimeLimit: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: Number, default: 120 },
        individualValue: { type: Number, default: 120 },
      },
      AutoPause: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: Number, default: 4 },
        individualValue: { type: Number, default: 4 },
      },
      OfflineTime: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: Boolean, default: false },
        individualValue: { type: Boolean, default: false },
      },
      NotifyUser: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: Boolean, default: false },
        individualValue: { type: Boolean, default: false },
      },
      WeekStart: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: String, default: "Monday" },
        individualValue: { type: String, default: "Monday" },
      },
      CurrencySymbol: {
        isTeamSetting: { type: Boolean, required: true, default: true },
        teamValue: { type: String, default: "$" },
        individualValue: { type: String, default: "$" },
      },
    },
    screenshotDeleteTime: {
      type: Number,
      default: 7776000,
    },
    activities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Activity", default: [] },
    ],
  },
  { timestamps: true }
);

userSchema.statics.updateSettings = async (employeeId, settings) => {
  const employee = await User.findById(employeeId);
  employee.settings = settings;
  employee.save();
};

userSchema.methods.setTeamInManager = async function (teamId) {
  const manager = this;
  manager.team.push(teamId);
  await manager.save();
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
