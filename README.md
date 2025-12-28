# Roact Motion Library

A declarative animation and interaction library for Roact in Roblox.

## Motion Components

These components are used to animate properties of their parent Instance. They are typically placed as children of the Roblox Instance they modify.

### Common Props
Most motion components share these properties:
- `To`: The target value.
- `From` (Optional): The starting value.
- `Speed`: Duration of the animation in seconds.
- `Delay`: Delay before starting the animation.
- `Easing`: `Enum.EasingStyle` (Default: `Sine`).
- `EasingDirection`: `Enum.EasingDirection` (Default: `InOut`).
- `Looped`: Whether the animation should loop.
- `OnFinished`: Callback function when the animation completes.

---

### `MotionSlide`
Animates the `Position` property.

```tsx
<frame Position={UDim2.fromScale(0, 0)} Size={UDim2.fromScale(0.1, 0.1)}>
    {/* Slide to the center of the screen over 1 second */}
    <MotionSlide To={UDim2.fromScale(0.5, 0.5)} Speed={1} Easing={Enum.EasingStyle.Bounce} />
</frame>
```

### `MotionFade`
Animates transparency. Defaults to `BackgroundTransparency` but can target others.

```tsx
<textlabel Text="Hello">
    {/* Fade text out */}
    <MotionFade Property="TextTransparency" To={1} Speed={2} />
    
    {/* Fade background out with delay */}
    <MotionFade Property="BackgroundTransparency" To={1} Speed={2} Delay={0.5} />
</textlabel>
```

### `MotionScale`
Animates the `Size`.

```tsx
<imagebutton>
    <OnHover>
        <MotionScale To={1.1} Speed={0.15} />
    </OnHover>
    <OnHoverEnd>
        <MotionScale To={1} Speed={0.15} />
    </OnHoverEnd>
</imagebutton>
```

### `MotionRotate`
Animates the `Rotation`.

```tsx
<imagelabel Image="...">
    {/* Rotate 360 degrees infinitely */}
    <MotionRotate To={360} Speed={2} Looped={true} />
</imagelabel>
```

### `MotionRGB`
Cycles through rainbow colors or animates to a specific color.

```tsx
<frame>
    {/* Rainbow effect on BackgroundColor3 */}
    <MotionRGB Property="BackgroundColor3" Speed={5} Looped={true} />
</frame>
```

### `MotionTypewriter`
Creates a typewriter effect for `TextLabel` or `TextButton`.

```tsx
<textlabel Text="Welcome to the game!">
    {/* Types out text at 0.05s per character */}
    <MotionTypewriter Speed={0.05} />
</textlabel>
```

### `MotionGradient`
Animates a `UIGradient`'s rotation or offset.

```tsx
<frame>
    <uigradient Color={...}>
        <MotionGradient Rotate={true} Speed={2} />
    </uigradient>
</frame>
```

### `MotionTween`
The generic component for tweening any property not covered by specific components.

```tsx
<uistroke Thickness={1}>
    <MotionTween Goal={{ Thickness: 5 }} Speed={0.5} Looped={true} />
</uistroke>
```

---

## Interaction Components

### `OnHover` & `OnHoverEnd`
Wrappers that trigger their children (motion components) based on mouse interaction.

```tsx
<textbutton Text="Hover Me">
    <OnHover>
        {/* Runs when mouse enters */}
        <MotionFade Property="BackgroundTransparency" To={0.5} Speed={0.2} />
    </OnHover>
    
    <OnHoverEnd>
        {/* Runs when mouse leaves */}
        <MotionFade Property="BackgroundTransparency" To={0} Speed={0.2} />
    </OnHoverEnd>
</textbutton>
```

### `HoverFrame`
A tooltip-like component that follows the mouse cursor.

```tsx
<imagebutton Image="...">
    {/* Shows a tooltip with text when hovering this button */}
    <HoverFrame 
        Size={UDim2.fromScale(0.2, 0.05)} 
        FadeTime={0.2} 
        Offset={new Vector2(15, 15)}
    >
        <textlabel Text="Item Description" Size={UDim2.fromScale(1, 1)} />
    </HoverFrame>
</imagebutton>
```

## Installation

This library is intended to be used as a git submodule in your `roblox-ts` project.

```bash
git submodule add git@github.com:R0-main/roact-motion-library.git src/shared/lib/roact-motion-library
```