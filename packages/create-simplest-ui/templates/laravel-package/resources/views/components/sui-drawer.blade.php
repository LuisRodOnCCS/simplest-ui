@props([
    'label',
    'open' => false,
    'closeLabel' => 'Close panel',
    'disableBackdropClose' => false,
])

<sui-drawer
    label="{{ $label }}"
    close-label="{{ $closeLabel }}"
    @if($open) open @endif
    @if($disableBackdropClose) disable-backdrop-close @endif
    {{ $attributes }}
>
    @isset($title)
        <span slot="title">{{ $title }}</span>
    @endisset

    {{ $slot }}

    @isset($footer)
        <div slot="footer">{{ $footer }}</div>
    @endisset
</sui-drawer>
