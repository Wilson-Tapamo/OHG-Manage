"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Save,
    Camera,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "language", label: "Language", icon: Globe },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your account preferences
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Sidebar */}
                <Card className="lg:w-64 h-fit">
                    <CardContent className="p-2">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400"
                                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </CardContent>
                </Card>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === "profile" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>
                                    Update your personal information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="text-xl">JD</AvatarFallback>
                                        </Avatar>
                                        <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors">
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Upload a new photo. JPG, PNG or GIF. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Form */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" defaultValue="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" defaultValue="Doe" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue="john.doe@optimum.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" defaultValue="+33 6 12 34 56 78" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input id="role" defaultValue="Director" disabled />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "notifications" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Choose what notifications you receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    {
                                        title: "Email Notifications",
                                        description: "Receive email updates about your projects",
                                    },
                                    {
                                        title: "Task Reminders",
                                        description: "Get reminded about upcoming task deadlines",
                                    },
                                    {
                                        title: "Invoice Alerts",
                                        description: "Notifications for new invoices and payments",
                                    },
                                    {
                                        title: "Team Updates",
                                        description: "Updates when team members complete tasks",
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-slate-500">{item.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                defaultChecked={index < 2}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage your password and security preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input id="currentPassword" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input id="newPassword" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input id="confirmPassword" type="password" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button>Update Password</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "appearance" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize how the app looks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {["Light", "Dark", "System"].map((theme) => (
                                        <div
                                            key={theme}
                                            className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition-colors text-center"
                                        >
                                            <Palette className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                            <p className="font-medium">{theme}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "language" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Language & Region</CardTitle>
                                <CardDescription>
                                    Set your preferred language and region
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Language</Label>
                                    <select className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                        <option>English</option>
                                        <option>Français</option>
                                        <option>Deutsch</option>
                                        <option>Español</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <select className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                        <option>Europe/Paris (UTC+1)</option>
                                        <option>Europe/London (UTC+0)</option>
                                        <option>America/New_York (UTC-5)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <Button>Save Preferences</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
