
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  MenuItem
} from "@mui/material";

import {
  BuildRounded,
  DashboardRounded,
  AddCircleOutlineRounded,
  RefreshRounded,
  DeleteOutlineRounded,
  SearchRounded,
  AssignmentRounded,
  CheckCircleOutlineRounded,
  PendingActionsRounded,
  CurrencyRupeeRounded,
  HandymanRounded
} from "@mui/icons-material";

const API = "http://localhost:8081";

const initialForm = {
  customerName: "",
  issueType: "",
  estimatedCost: "",
  resolved: false
};

const issueOptions = [
  "Pipe Leakage",
  "Blocked Drain",
  "Tap Repair",
  "Water Heater",
  "Water Supply",
  "Bathroom Fitting",
  "Other"
];

function StatCard({ title, value, caption, icon, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid #E6EAF0",
        borderRadius: 3,
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)"
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mt: 1, color: "#172554" }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.25,
              display: "flex",
              borderRadius: 2.5,
              color,
              bgcolor: `${color}14`
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 1.5 }}
        >
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  const notify = (severity, text) => {
    setMessage({ severity, text });
  };

  const loadRequests = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await fetch(`${API}/DisplayAll`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected API response");
      }

      setRequests(data);
    } catch {
      notify(
        "error",
        "Unable to load requests. Check that the backend is running and CORS is configured."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const total = requests.length;
  const resolvedCount = requests.filter((r) => r.resolved === true).length;
  const pendingCount = total - resolvedCount;

  const totalCost = requests.reduce(
    (sum, r) => sum + (Number(r.estimatedCost) || 0),
    0
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch = [
        request.id,
        request.customerName,
        request.issueType
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "resolved" && request.resolved === true) ||
        (statusFilter === "pending" && request.resolved !== true);

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function addRequest(event) {
    event.preventDefault();
    setMessage(null);

    if (!form.customerName.trim() || !form.issueType.trim()) {
      notify("warning", "Please enter the customer name and issue type.");
      return;
    }

    if (
      form.estimatedCost === "" ||
      !Number.isFinite(Number(form.estimatedCost)) ||
      Number(form.estimatedCost) < 0
    ) {
      notify("warning", "Enter a valid, non-negative estimated cost.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/Add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          issueType: form.issueType.trim(),
          estimatedCost: Number(form.estimatedCost),
          resolved: form.resolved
        })
      });

      if (!response.ok) {
        throw new Error("Request could not be saved");
      }

      setForm(initialForm);
      await loadRequests(false);
      notify("success", "Plumbing request created successfully.");
    } catch {
      notify(
        "error",
        "Could not save the request. Check the backend and API connection."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRequest(request) {
    const confirmed = window.confirm(
      `Delete the request for ${request.customerName || "this customer"}?`
    );

    if (!confirmed) return;

    setDeletingId(request.id);
    setMessage(null);

    try {
      const response = await fetch(`${API}/Delete/${request.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadRequests(false);
      notify("success", `Request #${request.id} deleted successfully.`);
    } catch {
      notify("error", "Unable to delete this request. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#FFFFFF"
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F7FB" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#101C35",
          borderBottom: "1px solid #263650"
        }}
      >
        <Toolbar sx={{ minHeight: "76px !important" }}>
          <Box
            sx={{
              width: 43,
              height: 43,
              borderRadius: 2.5,
              bgcolor: "#2563EB",
              display: "grid",
              placeItems: "center",
              mr: 1.5
            }}
          >
            <HandymanRounded sx={{ color: "#FFFFFF", fontSize: 25 }} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight={800} fontSize={20} color="white">
              PlumbCare
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#B7C5DC", letterSpacing: 1 }}
            >
              SERVICE MANAGEMENT
            </Typography>
          </Box>

          <Chip
            icon={<DashboardRounded />}
            label="Admin Dashboard"
            sx={{
              color: "#E5EDFF",
              bgcolor: "#233653",
              border: "1px solid #354966",
              "& .MuiChip-icon": { color: "#93B4FF" },
              display: { xs: "none", sm: "flex" }
            }}
          />

          <Tooltip title="Refresh requests">
            <IconButton
              onClick={() => loadRequests()}
              sx={{ color: "white", ml: 1 }}
              aria-label="Refresh requests"
            >
              <RefreshRounded />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              color: "#2563EB",
              fontWeight: 800,
              letterSpacing: 1.5
            }}
          >
            OVERVIEW / PLUMBING REQUESTS
          </Typography>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              color: "#15233D",
              mt: 0.5,
              fontSize: { xs: 27, md: 34 }
            }}
          >
            Service Dashboard
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>
            Manage customer requests, track estimated repair costs and monitor
            service resolution from one central workspace.
          </Typography>
        </Box>

        {message && (
          <Alert
            severity={message.severity}
            onClose={() => setMessage(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {message.text}
          </Alert>
        )}

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Requests"
              value={total}
              caption="All service records"
              icon={<AssignmentRounded />}
              color="#2563EB"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Pending Requests"
              value={pendingCount}
              caption="Awaiting resolution"
              icon={<PendingActionsRounded />}
              color="#D97706"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Resolved Requests"
              value={resolvedCount}
              caption="Successfully completed"
              icon={<CheckCircleOutlineRounded />}
              color="#059669"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Estimated Cost"
              value={totalCost.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
              })}
              caption="Combined cost estimates"
              icon={<CurrencyRupeeRounded />}
              color="#7C3AED"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: "1px solid #E6EAF0",
                height: "100%"
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                <Box
                  sx={{
                    bgcolor: "#EAF0FF",
                    color: "#2458C5",
                    borderRadius: 2,
                    p: 1,
                    display: "flex"
                  }}
                >
                  <AddCircleOutlineRounded />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    New Request
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter the service details
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <Stack
                component="form"
                onSubmit={addRequest}
                spacing={2.3}
              >
                <TextField
                  label="Customer Name"
                  name="customerName"
                  value={form.customerName}
                  onChange={updateField}
                  placeholder="Enter full name"
                  required
                  fullWidth
                  inputProps={{ maxLength: 100 }}
                  sx={fieldSx}
                />

                <TextField
                  select
                  label="Issue Type"
                  name="issueType"
                  value={form.issueType}
                  onChange={updateField}
                  required
                  fullWidth
                  sx={fieldSx}
                >
                  {issueOptions.map((issue) => (
                    <MenuItem key={issue} value={issue}>
                      {issue}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Estimated Repair Cost"
                  name="estimatedCost"
                  type="number"
                  value={form.estimatedCost}
                  onChange={updateField}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    )
                  }}
                  sx={fieldSx}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      name="resolved"
                      checked={form.resolved}
                      onChange={updateField}
                      color="success"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Mark request as resolved
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  startIcon={
                    saving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <AddCircleOutlineRounded />
                    )
                  }
                  sx={{
                    py: 1.4,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                    bgcolor: "#2458C5",
                    "&:hover": {
                      bgcolor: "#1947A3",
                      boxShadow: "none"
                    }
                  }}
                >
                  {saving ? "Saving Request..." : "Create Request"}
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                >
                  Request ID is generated automatically by the backend.
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #E6EAF0",
                overflow: "hidden",
                height: "100%"
              }}
            >
              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Service Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage submitted requests
                    </Typography>
                  </Box>

                  <Chip
                    label={`${filteredRequests.length} records`}
                    sx={{
                      bgcolor: "#EAF0FF",
                      color: "#2458C5",
                      fontWeight: 700,
                      alignSelf: { xs: "flex-start", sm: "center" }
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 3 }}
                >
                  <TextField
                    placeholder="Search name, issue or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded color="action" />
                        </InputAdornment>
                      )
                    }}
                    sx={fieldSx}
                  />

                  <TextField
                    select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="small"
                    sx={{ ...fieldSx, minWidth: 155 }}
                    label="Status"
                  >
                    <MenuItem value="all">All requests</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </TextField>

                  <Button
                    variant="outlined"
                    onClick={() => loadRequests()}
                    sx={{
                      minWidth: 45,
                      borderRadius: 2,
                      textTransform: "none"
                    }}
                    aria-label="Refresh table"
                  >
                    <RefreshRounded />
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {loading ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  sx={{ py: 9 }}
                >
                  <CircularProgress />
                  <Typography color="text.secondary" variant="body2">
                    Loading service requests...
                  </Typography>
                </Stack>
              ) : filteredRequests.length === 0 ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  spacing={1.5}
                  sx={{ py: 8, px: 3, textAlign: "center" }}
                >
                  <Box
                    sx={{
                      width: 58,
                      height: 58,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "#F0F4FA",
                      color: "#718096",
                      borderRadius: "50%"
                    }}
                  >
                    <BuildRounded fontSize="large" />
                  </Box>

                  <Typography fontWeight={700}>
                    No requests found
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Add a request or change your search and filters.
                  </Typography>

                  {(search || statusFilter !== "all") && (
                    <Button
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </Stack>
              ) : (
                <TableContainer sx={{ maxHeight: 540 }}>
                  <Table stickyHeader size="medium">
                    <TableHead>
                      <TableRow>
                        {[
                          "Request",
                          "Customer",
                          "Issue Type",
                          "Cost",
                          "Status",
                          "Action"
                        ].map((heading) => (
                          <TableCell
                            key={heading}
                            sx={{
                              bgcolor: "#F8FAFD",
                              color: "#526078",
                              fontWeight: 800,
                              fontSize: 12,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {heading}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow
                          key={request.id}
                          hover
                          sx={{
                            "&:last-child td": { borderBottom: 0 }
                          }}
                        >
                          <TableCell>
                            <Typography
                              fontWeight={800}
                              color="#2458C5"
                              variant="body2"
                            >
                              #{request.id}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ minWidth: 140 }}>
                            <Typography
                              fontWeight={600}
                              variant="body2"
                              color="#172554"
                            >
                              {request.customerName || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ minWidth: 125 }}>
                            <Typography variant="body2">
                              {request.issueType || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {Number(request.estimatedCost || 0).toLocaleString(
                              "en-IN",
                              {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 2
                              }
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                request.resolved ? "Resolved" : "Pending"
                              }
                              color={request.resolved ? "success" : "warning"}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>

                          <TableCell>
                            <Tooltip title="Delete request">
                              <span>
                                <IconButton
                                  aria-label={`Delete request ${request.id}`}
                                  color="error"
                                  disabled={deletingId === request.id}
                                  onClick={() => deleteRequest(request)}
                                  size="small"
                                >
                                  {deletingId === request.id ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <DeleteOutlineRounded />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Divider />

              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: "#FCFDFF"
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Showing {filteredRequests.length} of {total} requests
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "center", mt: 4, pb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            PlumbCare Service Management Portal · Spring Boot + React + Material UI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
