# Image Support Examples

This document demonstrates the comprehensive image support in the MMM parser.

## Standalone Images

### Basic Image
![Beautiful landscape](https://picsum.photos/800/400?random=1)

### Image with Descriptive Alt Text
![A serene lake surrounded by mountains during golden hour](https://picsum.photos/600/300?random=2)

### Local Image Reference
![Project logo](./assets/logo.png)

### Image with Special Characters
![Image with "quotes" and special chars](https://picsum.photos/400/200?random=3)

## Inline Images

This paragraph contains an inline image ![small icon](https://picsum.photos/32/32?random=4) within the text.

You can also have multiple inline images like this ![icon 1](https://picsum.photos/24/24?random=5) and this ![icon 2](https://picsum.photos/24/24?random=6) in the same sentence.

### Mixed with Other Formatting

Here's **bold text** with an ![inline image](https://picsum.photos/50/50?random=7) and some *italic text* followed by a [link](https://example.com).

## Images in Lists

### Unordered Lists
- ![Gallery image 1](https://picsum.photos/200/150?random=8) First gallery item
- ![Gallery image 2](https://picsum.photos/200/150?random=9) Second gallery item  
- ![Gallery image 3](https://picsum.photos/200/150?random=10) Third gallery item

### Ordered Lists
1. ![Step 1](https://picsum.photos/100/100?random=11) First step in the process
2. ![Step 2](https://picsum.photos/100/100?random=12) Second step to follow
3. ![Step 3](https://picsum.photos/100/100?random=13) Final step to complete

## Images in Blockquotes

> Here's a quote with an embedded image:
> 
> ![Inspirational quote background](https://picsum.photos/400/200?random=14)
> 
> "A picture is worth a thousand words" - and this demonstrates images in blockquotes.

## Images in Headings

### 📊 Analytics Dashboard ![chart icon](https://picsum.photos/32/32?random=15)

#### 🎨 Design Assets ![palette icon](https://picsum.photos/24/24?random=16)

## Complex Image Gallery

### Featured Images

![Hero image - Mountain landscape at sunset](https://picsum.photos/800/300?random=17)

### Image Grid

![Grid image 1](https://picsum.photos/250/200?random=18) ![Grid image 2](https://picsum.photos/250/200?random=19)

![Grid image 3](https://picsum.photos/250/200?random=20) ![Grid image 4](https://picsum.photos/250/200?random=21)

## Different Image Formats and Sources

### Photography
![Nature photography](https://picsum.photos/600/400?random=22)

### Web Graphics  
![Abstract digital art](https://picsum.photos/500/300?random=23)

### Technical Diagrams
![Architecture diagram](https://picsum.photos/700/400?random=24)

## Images with Tables

| Category | Example | Description |
|----------|---------|-------------|
| Nature | ![nature](https://picsum.photos/100/75?random=25) | Beautiful landscapes |
| Urban | ![city](https://picsum.photos/100/75?random=26) | City photography |
| Abstract | ![abstract](https://picsum.photos/100/75?random=27) | Digital art pieces |

## Edge Cases

### Empty Alt Text
![](https://picsum.photos/300/200?random=28)

### Very Long Alt Text
![This is an example of a very long alt text that describes an image in great detail, including all the visual elements, colors, composition, and other important aspects that would be useful for accessibility purposes](https://picsum.photos/400/250?random=29)

### Images with Query Parameters
![Image with parameters](https://picsum.photos/350/200?random=30&blur=2&grayscale=1)

## Real-World Examples

### Product Showcase
![Product hero shot](https://picsum.photos/600/400?random=31)

**Features:**
- ![Feature 1](https://picsum.photos/64/64?random=32) High quality materials
- ![Feature 2](https://picsum.photos/64/64?random=33) Modern design
- ![Feature 3](https://picsum.photos/64/64?random=34) User-friendly interface

### Documentation Examples

For installation, see the visual guide:

![Installation step 1](https://picsum.photos/400/200?random=35)

> **Note**: The image above shows the first step of the installation process.

Follow these steps:
1. ![Download](https://picsum.photos/32/32?random=36) Download the package
2. ![Install](https://picsum.photos/32/32?random=37) Run the installer  
3. ![Configure](https://picsum.photos/32/32?random=38) Configure your settings

### Before and After Comparison

**Before:**
![Before image](https://picsum.photos/300/200?random=39&blur=2)

**After:**
![After image](https://picsum.photos/300/200?random=40)

## Summary

The MMM parser provides comprehensive image support including:

- ✅ Standalone images with full styling
- ✅ Inline images within text  
- ✅ Images in all block elements (lists, blockquotes, headings)
- ✅ Proper handling of alt text and accessibility
- ✅ Support for various image formats and sources
- ✅ Responsive styling with Tailwind CSS classes