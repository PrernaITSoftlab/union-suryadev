import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

let opportunitiesStore = [
  {
    id: 1,
    title: "500kW Rooftop Solar EPC Subcontract Partnership",
    category: "Clean Energy",
    type: "CONTRACT",
    organization: "SunGrid Clean Energy Pvt Ltd",
    location: "Indore Industrial Zone",
    budget: "₹1.2 Crore",
    description: "Seeking registered discom class-A electrical contractors for 500kW commercial solar PV installation and net-metering grid inter-connection.",
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Substation Automation & SCADA Panel Wiring Consultant",
    category: "Electrical Engineering",
    type: "CONSULTING",
    organization: "MP West Zone Tech Advisory",
    location: "Ujjain Circle HQ",
    budget: "₹4.5 Lakhs",
    description: "Technical advisory contract for 33/11kV substation RTU panel telemetry, relay calibration, and Modbus protocol setup.",
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Insulated HV Safety Gear & Earthing Rod Bulk Supply Vendor",
    category: "Procurement",
    type: "VENDOR_RFP",
    organization: "MPVMAVAKS Safety Cell",
    location: "Bhopal Central Warehouse",
    budget: "₹18 Lakhs",
    description: "Call for bids for supplying 11kV/33kV FRP discharge earthing rods, rubber gloves (Class 3), and arc-flash face shields.",
    is_featured: false,
    created_at: new Date().toISOString()
  }
];

// Get all opportunities
router.get('/', (req, res) => {
  res.json({
    success: true,
    opportunities: opportunitiesStore
  });
});

// Admin toggle featured
router.put('/admin/opportunities/:id', authenticateToken, requireAdmin, (req, res) => {
  const { is_featured } = req.body;
  const item = opportunitiesStore.find(o => o.id === Number(req.params.id));
  if (!item) return res.status(404).json({ success: false, message: 'Opportunity not found' });
  item.is_featured = Boolean(is_featured);
  res.json({ success: true, message: 'Updated opportunity status', opportunity: item });
});

// Admin delete opportunity
router.delete('/admin/opportunities/:id', authenticateToken, requireAdmin, (req, res) => {
  opportunitiesStore = opportunitiesStore.filter(o => o.id !== Number(req.params.id));
  res.json({ success: true, message: 'Opportunity removed successfully' });
});

export default router;
