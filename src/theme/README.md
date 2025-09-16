# Global Markets Design System

A world-class design system built for modern fintech applications with premium aesthetics and consistent user experience.

## 🎨 Design Principles

- **Premium Feel**: High-end fintech aesthetics with attention to detail
- **Consistency**: Systematic approach to colors, typography, and spacing
- **Accessibility**: WCAG 2.1 AA compliant components
- **Performance**: Optimized for fast rendering and smooth animations
- **Scalability**: Modular system that grows with your application

## 🏗️ Architecture

```
src/theme/
├── colors.ts          # Color palette and semantic mappings
├── typography.ts      # Font scales and text styles
├── spacing.ts         # 8px-based spacing system
├── shadows.ts         # Depth and elevation system
├── borderRadius.ts    # Corner radius system
├── animations.ts      # Motion and transitions
├── components/        # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   ├── NavBar.tsx
│   └── index.ts
└── index.ts          # Main export file
```

## 🎯 Usage

### Import the design system:
```tsx
import { Button, Card, Input, colors } from '@/theme'
```

### Use components:
```tsx
<Card variant="elevated" padding="lg">
  <Button variant="primary" size="lg">
    Get Started
  </Button>
</Card>
```

## 🎨 Color System

### Primary Palette
- **Primary**: Blue scale for brand elements and CTAs
- **Secondary**: Navy scale for text and subtle elements
- **Neutral**: Slate scale for backgrounds and borders

### Semantic Colors
- **Success**: Green for positive actions and states
- **Warning**: Amber for caution and alerts
- **Error**: Red for errors and destructive actions
- **Accent**: Purple for highlights and special elements

### Usage Examples:
```tsx
// Using color tokens
<div className="bg-primary-500 text-white">Primary Button</div>

// Using semantic colors
<div className="bg-surface-primary border-border-primary">Card</div>
```

## 📝 Typography

### Font Stack
- **Primary**: Inter (modern, readable, professional)
- **Monospace**: SF Mono for code and data
- **Serif**: Georgia for editorial content

### Text Hierarchy
```tsx
// Display text (hero sections)
<h1 className="text-6xl font-bold">Hero Title</h1>

// Headings
<h2 className="text-3xl font-bold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection</h3>

// Body text
<p className="text-base leading-relaxed">Body content</p>
<p className="text-sm text-neutral-600">Secondary text</p>
```

## 📏 Spacing System

8px base unit for consistent layouts:

```tsx
// Component spacing
<div className="p-4">16px padding</div>
<div className="m-6">24px margin</div>

// Layout spacing
<div className="space-y-8">32px vertical spacing</div>
<div className="gap-12">48px grid gap</div>
```

## 🎭 Components

### Button
```tsx
<Button variant="primary" size="lg" loading={isLoading}>
  Submit
</Button>
```

### Card
```tsx
<Card variant="elevated" padding="lg" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Input
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  leftIcon={<Mail />}
/>
```

### Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Modal Title" size="lg">
  <ModalDescription>
    Modal content description
  </ModalDescription>
  <ModalFooter>
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

### Toast Notifications
```tsx
const { addToast } = useToast()

// Show success toast
addToast({
  variant: 'success',
  title: 'Success!',
  description: 'Your action was completed successfully.'
})
```

### Skeleton Loading
```tsx
// Text skeleton
<Skeleton variant="text" lines={3} />

// Card skeleton
<SkeletonCard />

// Custom skeleton
<Skeleton variant="rectangular" width="100%" height={200} />
```

## 🎬 Animations

### Transitions
All components use consistent timing and easing:
- **Fast**: 150ms for micro-interactions
- **Normal**: 200ms for most transitions
- **Slow**: 300ms for complex animations

### Hover Effects
- Subtle scale transforms (1.02x)
- Shadow elevation changes
- Color transitions

### Loading States
- Pulse animations for skeletons
- Spin animations for loading indicators
- Smooth state transitions

## 🎯 Best Practices

### Do's ✅
- Use semantic color names (`text-primary-600` vs `text-blue-600`)
- Follow the 8px spacing grid
- Use consistent border radius across components
- Implement proper loading and error states
- Test components in both light and dark modes

### Don'ts ❌
- Don't use arbitrary values (`w-[123px]`)
- Don't mix different shadow styles
- Don't skip animation transitions
- Don't use colors outside the defined palette
- Don't ignore accessibility requirements

## 🔧 Customization

### Extending Colors
```tsx
// Add custom colors to the palette
const customColors = {
  ...colors,
  brand: {
    50: '#f0f9ff',
    // ... rest of scale
  }
}
```

### Custom Components
```tsx
// Extend existing components
const CustomButton = styled(Button)`
  // Custom styles
`

// Or create new components following the same patterns
const CustomCard = ({ children, ...props }) => (
  <Card variant="elevated" {...props}>
    {children}
  </Card>
)
```

## 📱 Responsive Design

All components are mobile-first and responsive:
- Touch-friendly tap targets (44px minimum)
- Responsive typography scales
- Adaptive spacing and layouts
- Mobile-optimized interactions

## ♿ Accessibility

- WCAG 2.1 AA color contrast ratios
- Keyboard navigation support
- Screen reader friendly markup
- Focus management and indicators
- Semantic HTML structure

---

**Built with ❤️ for Global Markets Consulting**