import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CheckoutReturnForm() {
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    numOfDevices: "",
    action: "", // "checkOut" or "return"
    itStaffNotPresent: false,
    itStaffName: "",
  });
  
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [userSignature, setUserSignature] = useState<{x: number, y: number}[][]>([]);
  const [itStaffSignature, setItStaffSignature] = useState<{x: number, y: number}[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [historyLog, setHistoryLog] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const userCanvasRef = useRef<HTMLCanvasElement>(null);
  const itStaffCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingUser = useRef(false);
  const isDrawingItStaff = useRef(false);

  // Set initial date and time
  useEffect(() => {
    updateDateTime();
    loadHistoryLog();
  }, []);

  // Auto-select "Select" in IT Staff dropdown when "IT Staff not present" is checked
  useEffect(() => {
    if (formData.itStaffNotPresent) {
      setFormData(prev => ({ ...prev, itStaffName: "select" }));
    }
  }, [formData.itStaffNotPresent]);

  // Initialize canvases
  useEffect(() => {
    const initCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, signature: {x: number, y: number}[][]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw existing signature
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      
      signature.forEach(stroke => {
        if (stroke.length < 1) return;
        
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        
        ctx.stroke();
      });
    };
    
    initCanvas(userCanvasRef, userSignature);
    initCanvas(itStaffCanvasRef, itStaffSignature);
  }, [userSignature, itStaffSignature]);

  const updateDateTime = () => {
    const now = new Date();
    
    // Format: "November 20, 2023 8:21 PM"
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const datePart = now.toLocaleDateString('en-US', options);
    
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    const timePart = `${hours}:${minutes} ${ampm}`;
    setCurrentDateTime(`${datePart} ${timePart}`);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, action: value }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name as keyof typeof formData] }));
  };

  const clearForm = () => {
    setFormData({
      name: "",
      grade: "",
      section: "",
      numOfDevices: "",
      action: "",
      itStaffNotPresent: false,
      itStaffName: "",
    });
    setUserSignature([]);
    setItStaffSignature([]);
    setSubmitSuccess(false);
    setSubmitError("");
  };

  // Get coordinates relative to canvas
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      // Touch event
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  // Drawing functions for user signature
  const startDrawingUser = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingUser.current = true;
    const canvas = userCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCoordinates(e, canvas);
    setUserSignature(prev => [...prev, [{x: coords.x, y: coords.y}]]);
  };

  const drawUser = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingUser.current) return;
    
    const canvas = userCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCoordinates(e, canvas);
    setUserSignature(prev => {
      const newStrokes = [...prev];
      const lastStroke = newStrokes[newStrokes.length - 1];
      if (lastStroke) {
        lastStroke.push({x: coords.x, y: coords.y});
      }
      return newStrokes;
    });
  };

  const stopDrawingUser = () => {
    isDrawingUser.current = false;
  };

  // Drawing functions for IT staff signature
  const startDrawingItStaff = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (formData.itStaffNotPresent) return;
    
    isDrawingItStaff.current = true;
    const canvas = itStaffCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCoordinates(e, canvas);
    setItStaffSignature(prev => [...prev, [{x: coords.x, y: coords.y}]]);
  };

  const drawItStaff = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingItStaff.current || formData.itStaffNotPresent) return;
    
    const canvas = itStaffCanvasRef.current;
    if (!canvas) return;
    
    const coords = getCoordinates(e, canvas);
    setItStaffSignature(prev => {
      const newStrokes = [...prev];
      const lastStroke = newStrokes[newStrokes.length - 1];
      if (lastStroke) {
        lastStroke.push({x: coords.x, y: coords.y});
      }
      return newStrokes;
    });
  };

  const stopDrawingItStaff = () => {
    isDrawingItStaff.current = false;
  };

  // Save form data to Google Sheet
  const saveToGoogleSheet = async (data: any) => {
    try {
      // In a real implementation, you would:
      // 1. Send data to your backend API
      // 2. Your backend would use Google Sheets API to append the data
      // 
      // Example backend endpoint:
      // const response = await fetch('/api/save-to-sheet', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to save to Google Sheet');
      // }
      
      // For demonstration, we'll simulate the API call
      console.log("Saving to Google Sheet:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error("Error saving to Google Sheet:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    
    try {
      const submissionData = {
        ...formData,
        dateTime: currentDateTime,
        userSignature,
        itStaffSignature,
        submittedAt: new Date().toISOString(),
      };
      
      // Save to Google Sheet
      const saved = await saveToGoogleSheet(submissionData);
      
      if (saved) {
        // Show success message
        setSubmitSuccess(true);
        
        // Add to local history
        setHistoryLog(prev => [submissionData, ...prev]);
        
        // Reset form after successful submission
        setTimeout(() => {
          clearForm();
        }, 3000);
      } else {
        throw new Error("Failed to save to Google Sheet");
      }
    } catch (error) {
      setSubmitError("Failed to submit form. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistoryLog = () => {
    // In a real implementation, you would:
    // 1. Fetch data from your backend API
    // 2. Your backend would retrieve data from Google Sheets
    // 
    // Example:
    // const response = await fetch('/api/get-history');
    // const data = await response.json();
    // setHistoryLog(data);
    
    // For demonstration, we'll use mock data
    const mockHistory = [
      {
        id: 1,
        name: "Brenda Hernández",
        grade: "3",
        section: "A",
        numOfDevices: "2",
        action: "checkOut",
        dateTime: "November 20, 2023 2:15 PM",
        submittedAt: "2023-11-20T14:15:00Z"
      },
      {
        id: 2,
        name: "Adriana Soto",
        grade: "4",
        section: "B",
        numOfDevices: "1",
        action: "return",
        dateTime: "November 20, 2023 3:30 PM",
        submittedAt: "2023-11-20T15:30:00Z"
      },
      {
        id: 3,
        name: "Lucy Horn",
        grade: "5",
        section: "C",
        numOfDevices: "3",
        action: "checkOut",
        dateTime: "November 20, 2023 4:45 PM",
        submittedAt: "2023-11-20T16:45:00Z"
      }
    ];
    setHistoryLog(mockHistory);
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleBackToForm = () => {
    setShowHistory(false);
  };

  const exportHistoryLog = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'Grade', 'Section', 'Devices', 'Action', 'Date/Time', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...historyLog.map(entry => [
        entry.id,
        `"${entry.name}"`,
        entry.grade,
        entry.section,
        entry.numOfDevices,
        entry.action,
        `"${entry.dateTime}"`,
        entry.submittedAt
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `checkout-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show history table if requested
  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header Bar */}
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm">8:21PM</span>
            <span className="text-sm">Thu 20 Nov</span>
          </div>
          <div className="text-sm font-medium">
            Checkout & Return Form History
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-6 h-4 border border-white rounded-sm flex items-center justify-center mr-1">
                <div className="w-4 h-0.5 bg-white"></div>
              </div>
              <span className="text-xs">57%</span>
            </div>
            <div className="w-6 h-4 border border-white rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 border-t-2 border-l-2 border-white transform rotate-45 translate-y-0.5"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-2 border-black bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">History Log</h1>
                <div className="flex space-x-2">
                  <Button 
                    onClick={exportHistoryLog}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Export History Log
                  </Button>
                  <Button 
                    onClick={handleBackToForm}
                    className="bg-gray-200 hover:bg-gray-300 text-black"
                  >
                    Back to Form
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Devices</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Date/Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.id}</TableCell>
                        <TableCell>{entry.name}</TableCell>
                        <TableCell>{entry.grade}</TableCell>
                        <TableCell>{entry.section}</TableCell>
                        <TableCell>{entry.numOfDevices}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.action === "checkOut" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {entry.action}
                          </span>
                        </TableCell>
                        <TableCell>{entry.dateTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {historyLog.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No history records found
                </div>
              )}

              <div className="mt-6 text-sm text-gray-600">
                <p className="mb-2">Note: This history is stored locally in your browser.</p>
                <p>To store submissions in Google Sheets:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Create a Google Sheet with columns: Name, Grade, Section, Devices, Action, DateTime</li>
                  <li>Set up Google Sheets API in Google Cloud Console</li>
                  <li>Implement a backend service to handle API requests</li>
                  <li>Configure your backend to use your Google Sheet ID</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Bar */}
        <div className="bg-gray-800 p-3 flex flex-col space-y-2">
          <Button 
            className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2"
            onClick={exportHistoryLog}
          >
            Export History Log
          </Button>
          <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2">
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border border-white rounded-full flex items-center justify-center mr-2">
                <div className="w-2 h-0.5 bg-white rotate-45 translate-y-0.5"></div>
                <div className="w-2 h-0.5 bg-white -rotate-45 -translate-y-0.5 -translate-x-0.5"></div>
              </div>
              Fill out form
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header Bar */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm">8:21PM</span>
          <span className="text-sm">Thu 20 Nov</span>
        </div>
        <div className="text-sm font-medium">
          Checkout & Return Form (iPads & Chromebooks) (1).pdf
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-6 h-4 border border-white rounded-sm flex items-center justify-center mr-1">
              <div className="w-4 h-0.5 bg-white"></div>
            </div>
            <span className="text-xs">57%</span>
          </div>
          <div className="w-6 h-4 border border-white rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 border-t-2 border-l-2 border-white transform rotate-45 translate-y-0.5"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl border-2 border-black bg-white">
          <CardContent className="p-8">
            {/* Form Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Checkout & Return Form</h1>
              <h2 className="text-xl font-bold">(iPads & Chromebooks)</h2>
            </div>

            {/* Success/Error Messages */}
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                Form submitted successfully! Data saved to Google Sheet.
              </div>
            )}
            {submitError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                {submitError}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Date & Time Field */}
              <div className="flex items-center">
                <Label className="w-32 text-base font-medium">Date & Time:</Label>
                <div className="flex-1 border-0 border-b-2 border-black px-2 py-1">
                  {currentDateTime}
                </div>
                <Button 
                  onClick={updateDateTime}
                  className="ml-4 bg-gray-200 hover:bg-gray-300 text-black"
                >
                  Update
                </Button>
              </div>

              {/* Name Field */}
              <div className="flex items-center">
                <Label className="w-32 text-base font-medium">Name:</Label>
                <Select onValueChange={(value) => handleSelectChange("name", value)} value={formData.name}>
                  <SelectTrigger className="flex-1 border-0 border-b-2 border-black rounded-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brenda Hernández">Brenda Hernández</SelectItem>
                    <SelectItem value="Adriana Soto">Adriana Soto</SelectItem>
                    <SelectItem value="Lucy Horn">Lucy Horn</SelectItem>
                    <SelectItem value="Andrea Larios">Andrea Larios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grade and Section */}
              <div className="flex space-x-8">
                <div className="flex items-center flex-1">
                  <Label className="w-20 text-base font-medium">Grade:</Label>
                  <Select onValueChange={(value) => handleSelectChange("grade", value)} value={formData.grade}>
                    <SelectTrigger className="flex-1 border-0 border-b-2 border-black rounded-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center flex-1">
                  <Label className="w-20 text-base font-medium">Section:</Label>
                  <Select onValueChange={(value) => handleSelectChange("section", value)} value={formData.section}>
                    <SelectTrigger className="flex-1 border-0 border-b-2 border-black rounded-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Devices and Radio Buttons */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center flex-1">
                  <Label className="w-32 text-base font-medium">#of Devices:</Label>
                  <Input
                    name="numOfDevices"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.numOfDevices}
                    onChange={handleInputChange}
                    className="flex-1 border-0 border-b-2 border-black rounded-none px-0 focus-visible:ring-0"
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <RadioGroup value={formData.action} onValueChange={handleRadioChange} className="flex space-x-6">
                    <div className="flex items-center">
                      <RadioGroupItem value="checkOut" id="checkOut" className="border-2 border-black" />
                      <Label htmlFor="checkOut" className="ml-2 text-base font-medium">
                        Check Out:
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="return" id="return" className="border-2 border-black" />
                      <Label htmlFor="return" className="ml-2 text-base font-medium">
                        Return:
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Signature Sections */}
              <div className="grid grid-cols-2 gap-8 mt-10">
                <div>
                  <Label className="block text-base font-medium mb-2">User’s Signature</Label>
                  <div className="relative h-32 border-2 border-black rounded-sm bg-gray-50">
                    <canvas
                      ref={userCanvasRef}
                      width={500}
                      height={128}
                      className="w-full h-full cursor-crosshair touch-none"
                      onMouseDown={startDrawingUser}
                      onMouseMove={drawUser}
                      onMouseUp={stopDrawingUser}
                      onMouseLeave={stopDrawingUser}
                      onTouchStart={startDrawingUser}
                      onTouchMove={drawUser}
                      onTouchEnd={stopDrawingUser}
                    />
                  </div>
                </div>
                <div>
                  <Label className="block text-base font-medium mb-2">IT Staff’s Signature</Label>
                  <div className="relative h-32 border-2 border-black rounded-sm bg-gray-50">
                    {formData.itStaffNotPresent ? (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        IT Staff not present.
                      </div>
                    ) : (
                      <canvas
                        ref={itStaffCanvasRef}
                        width={500}
                        height={128}
                        className="w-full h-full cursor-crosshair touch-none"
                        onMouseDown={startDrawingItStaff}
                        onMouseMove={drawItStaff}
                        onMouseUp={stopDrawingItStaff}
                        onMouseLeave={stopDrawingItStaff}
                        onTouchStart={startDrawingItStaff}
                        onTouchMove={drawItStaff}
                        onTouchEnd={stopDrawingItStaff}
                      />
                    )}
                  </div>
                  {/* IT Staff Dropdown with label */}
                  <div className="mt-4">
                    <Label className="block text-base font-medium mb-2">IT Staff</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("itStaffName", value)} 
                      value={formData.itStaffName}
                      disabled={formData.itStaffNotPresent}
                    >
                      <SelectTrigger className="w-full border-0 border-b-2 border-black rounded-none focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select IT Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="Gerardo Tobar">Gerardo Tobar</SelectItem>
                        <SelectItem value="Eduardo Soriano">Eduardo Soriano</SelectItem>
                        <SelectItem value="Yonatan Rodríguez">Yonatan Rodríguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-12 flex items-end justify-between">
                <div>
                  <div className="flex">
                    <span className="text-2xl font-bold text-blue-600">E</span>
                    <span className="text-2xl font-bold text-red-600">A</span>
                    <span className="text-2xl font-bold text-blue-600">E</span>
                    <span className="text-2xl font-bold text-red-600">S</span>
                  </div>
                  <div className="text-xs">Elementary School Technology</div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Checkbox
                      id="itStaffNotPresent"
                      checked={formData.itStaffNotPresent}
                      onCheckedChange={() => handleCheckboxChange("itStaffNotPresent")}
                      className="border-2 border-black data-[state=checked]:bg-black"
                    />
                    <Label htmlFor="itStaffNotPresent" className="ml-2 text-sm">
                      IT Staff not present
                    </Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-sm px-4 py-2"
                      onClick={clearForm}
                    >
                      Clear Form
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 p-3 flex flex-col space-y-2">
        <Button 
          className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2"
          onClick={handleViewHistory}
        >
          View History Log
        </Button>
        <Button 
          className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2"
          onClick={exportHistoryLog}
        >
          Export History Log
        </Button>
        <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border border-white rounded-full flex items-center justify-center mr-2">
              <div className="w-2 h-0.5 bg-white rotate-45 translate-y-0.5"></div>
              <div className="w-2 h-0.5 bg-white -rotate-45 -translate-y-0.5 -translate-x-0.5"></div>
            </div>
            Fill out form
          </div>
        </Button>
      </div>
    </div>
  );
}
